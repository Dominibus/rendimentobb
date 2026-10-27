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
