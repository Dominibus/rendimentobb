# Feedback e requisiti di RendimentoBB

Registro di continuità del progetto. Non contiene nomi di clienti, credenziali o dati sanitari. Gli esiti riferiti dal titolare sono distinti da verifiche indipendenti. Aggiornato 27 ottobre 2026.

| ID | Evidenza / richiesta | Stato e criterio di accettazione |
|---|---|---|
| FB-20261027-01 | Il titolare riferisce che un amico non trovava il percorso per locali, poliambulatorio e studi. | Causa confermata nel codice: accesso desktop non presente, link commerciali omessi nelle ricostruzioni del menu mobile. RC205: entry Locali e studi persistente nei menu; pagina dedicata già esistente valorizzata; analisi e PMS separati e visibili. Da confermare con lo stesso tester dopo pubblicazione approvata. |
| FB-20261027-02 | Richiesta di confronti aggiornati almeno sui capoluoghi, per ampliare il raggio d'azione. | RC205: 8 capoluoghi con serie documentata, 20 selezionabili. Altri 12 senza dato compatibile validato: ipotesi proprie, nessun riciclo di medie nazionali/regionali o altre città. |
| FB-20261026-01 | Salvataggio Live Demo inizialmente sembrava inattivo. Il titolare ha rettificato confermando modifica e salvataggio su PC e iPhone. | Chiuso su conferma del titolare; non riaprire come bug. Numero ospiti demo preimpostato, differente dal PMS operativo. |
| FB-20261026-02 | In anteprima anonima PMS il salvataggio mostrava un errore di connessione. | RC202: dimostrato accesso client con utente demo privo di getIdToken e zero richieste; blocco contestuale prima delle scritture, idempotenza conservata. |
| FB-20261026-03 | Richiesta chiarezza su fonti, risultati, differenza ipotesi/registrazioni e risposte chatbot con refusi. | Non presentare ADR pubblicato come incassato, prenotazioni come pagamenti, né ROI illustrativo come mercato verificato. Preservare chiarimenti del chatbot e perimetro del PDF/analisi correnti. |
| REQ-STUDI | Esigenza di gestire stanze a canone mensile o fasce ricorrenti professionali, anche in spazi di poliambulatorio. | Ambito immobiliare: stanze, contratti, calendario, movimenti e attività. Nessun paziente, prestazione sanitaria o fatturato clinico. Non pubblicare dettagli economici o dati del caso personale come demo. |

Vincoli: nessuna pubblicazione automatica della patch; nuovi acquisti sospesi; nessuna nuova funzione, regime fiscale deciso dal software o dato di mercato inventato. Cloud, trial e verifiche iPhone residue mantengono lo stato dell'audit RC204 finché non arrivano evidenze nuove.

## Verifica pubblica successiva a RC205 — 27/10/2026

- Main `3925978dace1294c816bebe166eeeff4988a0890`: 702 blob coerenti con la candidata RC205; 19 asset/pagine pubblici modificati con HTTP 200 e byte attesi.
- Bari, Bologna, Venezia e Palermo provate dal selettore; Trento non eredita dati sostitutivi. Demo commerciale calendario e Autopilot coerenti; domanda con refusi sugli incassi riconosciuta.
- BUG-20261027-CHAT: Free, dopo calcolo, domanda `che cose il casflow?` riceveva il blocco analisi invece della definizione. Riprodotto nel browser pubblico; `casflow` mancava nelle correzioni lessicali. RC206 aggiunge solo questa correzione, escludendo i contesti con nomi personali. Permessi e formule invariati. Correzione testata localmente, non ancora pubblicata.
- Restano da verificare login Investor, salvataggi reali, PDF con utenza Pro e iPhone/Safari reale; nessun accesso cloud eseguito.
- BUG-20261027-ACADEMY: la scheda Analisi città prometteva confronti di ROI, occupazione e ADR, assenti nella serie documentata. RC206 allinea testo IT/EN alla misura effettiva: prezzi base pubblicati per notte, fonte e periodo. Nessun nuovo dato o formula.

## RC207 — uniformità e guida alla compilazione, 27/10/2026

- FB-HEADER-COMM: il titolare, autenticato Pro, vedeva Accedi/Live Demo e nessun badge nella pagina commerciale. Screenshot ricevuti. Causa confermata: shell statica diversa; nel PMS demo il pulsante Accedi era impostato indipendentemente dalla sessione, mentre l'archivio aveva un renderer account separato. Non è stata dimostrata una perdita dei diritti Pro. RC207 usa lo stesso header e footer delle altre pagine commerciali IT/EN, senza cambiare piani o permessi.
- FB-MOBILE-LABEL: il tab mobile verso /dashboard/ si chiamava Pannello. RC207: Dashboard anche in italiano; CTA della home allineata.
- FB-INPUT-GUIDE: il titolare trova complesso compilare il PMS commerciale. RC207: legenda, passaggi ordinati, esempi fittizi, descrizioni dei campi e risposte Autopilot per compilazione/movimenti. Nessuna compilazione automatica, scelta fiscale o invio esterno. Assistente comune indirizzato all'Autopilot locale o alla guida, senza mostrare snapshot B&B ricordati.
- Test Investor ordinario autenticato: confermato badge, salvataggio server di un nuovo scenario fittizio Trento (prezzo 170.207 €, equity 50.207 €, mutuo 120.000 €), cashflow −9.182,42 €/anno e lettura coerente nel chatbot, blocco PDF Pro verificato. Nessuna email di verifica inviata. Il titolare conferma indirizzo fittizio e non verificato.
- Browser desktop interrotto da timeout durante apertura Simulazioni salvate. Recupero della stessa analisi dopo logout/nuovo login, scritture PMS e nuova verifica visiva RC207 restano APERTI; non dichiararli superati. Analisi di collaudo lasciata nell'archivio; nessun dato precedente cancellato.
