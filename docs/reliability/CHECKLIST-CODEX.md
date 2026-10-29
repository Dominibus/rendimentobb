# Controllo indipendente RC228

Partire dal main aggiornato e dal branch della PR, non da un vecchio checkout. Registrare gli SHA effettivi. Non fare merge/deploy né toccare record reali durante l'audit.

- [ ] Confermare PR #7 già integrata e assenza di modifiche sovrapposte; leggere diff intero e AGENTS.md.
- [ ] Verificare classificazioni: ISTAT/OMI ufficiali, Inside Airbnb privato, tassi/prezzi/score interni o input, demo sintetiche. Nessuna attribuzione ufficiale delle ipotesi.
- [ ] Confrontare registro, JSON originali, README dei dataset e riferimenti file/linea. Le date sconosciute rimangono null; date consultazione/acquisizione/pubblicazione distinte.
- [ ] Verificare termini specifici OMI e Inside Airbnb con prova documentata. Il blocco acquisizione provider avviene prima di ogni richiesta HTTP e conserva output esistente.
- [ ] Verificare URL ufficiali aggiornati e condizioni dei connettori futuri, senza dedurre conformità dal dominio dell'ente.
- [ ] `npm ci && npm test` (comandi separati se l'ambiente richiede); leggere eventuali fail, non solo codice di uscita dell'ultimo comando.
- [ ] `node scripts/audit-source-registry.mjs`: offline_local_integrity_only; published:false, remoteAvailabilityChecked:false. Nessun file scritto dal comando normale.
- [ ] `node tests/rc213-financial-identities.mjs` e `python3 -m unittest discover -s tests -p '*.py'`.
- [ ] Simulare in directory temporanea: JSON corrotto, file nuovo non censito, modulo browser divergente, URL non HTTPS, path traversal, scadenza revisione. Devono fallire/segnalare senza sostituire dati validi.
- [ ] Aprire la vista admin in Chromium a390 e1440px IT/EN, espandere schede e verificare date/limiti/keyboard/overflow. Verificare che logout e letture fallite eliminino la vista secondo il controller esistente.
- [ ] Nessun nuovo endpoint, segreto, richiesta provider nel browser, dipendenza di produzione, scrittura Firestore, invio email o cambiamento Stripe.
- [ ] Nessuna modifica a formule, soglie, trial di 30 giorni, acquisti sospesi, PDF Investor o dati storici.
- [ ] Distinguere fase1 implementata da envelope PDF/CSV, monitor normativo, nuovi connettori e digest email solo proposti.
- [ ] Verificare CI e preview Vercel della PR; Netlify estraneo al percorso di rilascio. Nessuna preview è produzione autenticata.
- [ ] Smoke test autenticato in ambiente appropriato dopo eventuale rilascio autorizzato: creazione scenario controllato → salvataggio → riapertura → PDF/CSV consentiti; confronto con storico invariato; PMS/calendario con dati sintetici; cambio lingua e logout. Usare permessi e flussi esistenti.
- [ ] Riportare separatamente: verificato nel codice, test locale, browser sintetico, produzione, non verificabile. Nessuna dichiarazione “tutto aggiornato/certificato” da sola suite verde.

Revisione separata obbligatoria prima di envelope persistente, aliquote/base imponibile, modifiche ai motori o permessi, nuovi job di notifica o promozione automatica dei dati.
