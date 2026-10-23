# RC194 — diagnosi preventiva

Richiesta: sei profili, riscontri sui dati, reperibilità dalla home e verifica connessioni a chatbot/dashboard/PDF. Baseline RC193 già applicata: main `79a785cb2b15b8b80efc16c1ff932e3935dd9c1d`; campioni index, motore commerciale e orchestrator confrontati con SHA GitHub, corrispondenti alla copia locale.

Osservazioni nel browser pubblico: home/menu/footer privi del percorso commerciale; Analizza contiene il link corretto. Nuovo modulo funziona e dichiara memoria locale alla pagina, nessun PDF/salvataggio. Verificati 305 mensile e per utilizzo con IVA esplicita, e locale a 1.800 €/mese. Il chatbot risponde correttamente alla prima domanda commerciale, ma il seguito “Cashflow” suggerito dalla UI torna alla definizione B&B: difetto riprodotto. Il percorso in risposta è testo non cliccabile.

Perimetro patch: reperibilità da home, menu, footer, dashboard e pagina piani; chiarire funzioni realmente connesse e non disponibili; collegamento cliccabile dal chatbot e continuità delle domande commerciali brevi senza leggere dati account/simulazione. Rafforzare distinzione fra ricavi immobiliari e fatturato di negozi/prestazioni mediche. Indicazioni per verificare fonti OMI e preventivi/contratti, senza introdurre tariffe territoriali inventate.

Non abilitare salvataggi, report commerciali, migrazioni o KPI turistici sui dati commerciali: richiedono fase 2 separata. Nuovo codice senza costo API; nessuna produzione modificata. Test: sei casi indipendenti, conversazioni multi-turno/privacy/PDF/reset/cambio tema, link IT/EN, UI e suite completa. Il test autenticato Pro resta distinto dalla demo pubblica.
