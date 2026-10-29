# Verifiche RC228 e limiti

Base: main `ad44c31c2baa72627171dd0147232bd37ea7ec48`, PR #7 già integrata. Nessuna altra PR aperta al controllo della base. Il branch dedicato non modifica main o produzione.

| Verifica | Risultato locale |
|---|---|
| npm ci --ignore-scripts | Dipendenze dal lockfile installate; nessuna dipendenza nuova introdotta |
| npm test | 2.169 test passati (2.163 esistenti e 6 nuovi), nessun fallimento nella suite dopo la modifica applicativa |
| node tests/rc213-financial-identities.mjs | 638 controlli passati |
| python3 -m unittest discover -s tests -p '*.py' | 37 test passati |
| node scripts/audit-source-registry.mjs | Integrità locale verificata; registro di 14 famiglie,110 file unici censiti; nessuna richiesta esterna o pubblicazione |
| Test mirati registro + admin | 16 passati, ripetuti dopo l'ampliamento delle schede e il riepilogo delle licenze |
| git diff --check | Passato |

I 6 nuovi test controllano byte locali e copertura dei dataset, corruzione/file non registrati, divergenza modulo browser, schede/URL/percorsi invalidi, scadenze e distinzione da sincronizzazione, rendering DOM IT/EN, gate provider senza rete e conservazione output. I test esistenti admin coprono accesso verificato, logout, risposta tardiva e indisponibilità.

La verifica del rendering usa DOM sintetico. Il tentativo di avviare Chromium locale non è riuscito: browser non preinstallato e download del pacchetto ricevuto non valido (archivio ZIP non utilizzabile). Nessuno screenshot viene spacciato per verifica browser. Responsive effettivo, tastiera e intero percorso amministrativo autenticato vanno controllati su preview Vercel; checklist disponibile. Nessuna nuova prova autenticata in produzione in questa fase.

Le suite emulatori Firestore e security-tests separate non sono state rieseguite in questo intervento; nessuna regola, endpoint o persistenza modificata. I test Node esistenti di autorizzazione e isolamento sono passati. L'inventario non è una certificazione editoriale articolo per articolo, fiscale, di licenza specifica OMI, di termini di riuso derivato Inside Airbnb o di attualità di tutte le fonti.

La CI controlla integrità; non approva automaticamente schede con revisione aperta. Le fasi nuove di envelope persistente, PDF/CSV, monitor normativo e notifiche sono proposte e richiedono revisione separata.
