# Inventario prima del codice — selezione candidati

Base verificata il 30 ottobre 2026: main `476f21d25045346a42ff0c1d2f7e5e05ae69cde4`. Fetch Git riuscito; nessuna PR aperta al controllo. Branch `feat/candidate-screening`, worktree separato per preservare il lavoro precedente. Letti AGENTS.md e documenti di affidabilità (README, INVENTARIO, ARCHITETTURA).

| Modulo esaminato | Disponibile / riuso | Lacuna |
| --- | --- | --- |
| `/immobili/`, `api/property-search.js` | Ricerca di scenari sintetici e scheda manuale; rimangono distinti da annunci verificati | Non gestisce una lista di candidati dell'utente |
| `js/property-comparison.js` | Confronto A/B, costi mancanti distinti da zero, `safeListingURL` riutilizzabile | Due righe, niente criteri o importazione multipla |
| `js/booking-import.js` | Parser CSV puro e limitato: 500 KB, 50 righe, separatori/virgolette/BOM; nessuna scrittura nel parser | Schema prenotazioni inadatto: il nuovo schema candidati rifiuterà colonne inattese; nessun riuso del salvataggio PMS |
| `js/investment-journey.js`, `js/property-scenario-inputs.js` | Handoff esistente e modulo finale del simulatore che sovrascrive solo input espliciti | Handoff legacy manuale usa localStorage; i link delle schede supportano solo quattro città e campi obbligatori. Serve un ramo esplicito e validato per candidati, senza archivio |
| `js/roi-engine.js`, `js/investment-assumptions.js`, `js/investment-analysis-state.js` | Motore canonico, input validati, distinzione ROI N/A e risultati riservati | Calcolare ROI in una nuova pagina pubblica introdurrebbe un percorso di accesso parallelo: escluso |
| Dashboard e PMS | Proprietà account e analisi salvate con identità diverse | Un candidato non deve diventare una proprietà, prenotazione o acquisto: nessuna integrazione di scrittura |
| Chatbot/Autopilot, correzioni A1–A4 | Router e risposte bilingui; builder contestuali di sola lettura | Nessuna sorgente pagina per candidati, criteri e motivazioni |
| Header/footer, traduzioni e stile | Componenti condivisi, evento `rb_language_changed`, `rb_auth_ready` | Occorre un ingresso nella pagina Immobili; home invariata |

## Decisioni per la prima versione

- Workspace in `/immobili/candidati/`, collegato dal percorso immobili esistente; nessuna seconda ricerca o richiesta a portali.
- Fino a 50 candidati: inserimento manuale, CSV con anteprima e conferma delle sole righe valide. Riferimento stabile, duplicati espliciti, nessun fuzzy matching di persone/indirizzi.
- Elenco solo nella memoria della pagina: ricarica/chiusura lo elimina. Analizza si apre in nuova scheda per conservarlo. Nessun nuovo archivio account, localStorage o sessionStorage del workspace.
- Vincoli: budget totale dichiarato (prezzo+lavori+altre spese), città/zona esatte, superficie minima e capitale disponibile rispetto al capitale previsto dall'utente. Preferenza zona separata, senza pesi. Mancanze sempre visibili; nessuna classifica aggregata.
- Prezzo/superficie/costi sono dati dichiarati. Ipotesi economiche possono essere inserite per candidato o applicate esplicitamente ai candidati selezionati; nessun default comune nascosto.
- Il nuovo elenco non calcola ROI o score. La valutazione economica avviene nel simulatore canonico dopo il trasferimento e il completamento degli input, con motore e piani invariati. Spese iniziali non sono riclassificate come costo mensile o sommate silenziosamente al prezzo.
- Il ramo candidati del trasferimento esistente usa un URL interno validato, identifica il riferimento e riporta campi trasferiti/mancanti; non salva, non calcola e non certifica finanziamenti. Dati mancanti restano vuoti, non vengono riempiti da fonti OMI/turismo.
- Assistente: legge la stessa valutazione corrente della tabella; nessuna memoria autonoma di numeri. Cambio candidato/account/logout e uscita dalla pagina invalidano il contesto opportuno.
- Limiti e ampliamenti sensibili (salvataggio account, portali autorizzati, dati realizzati) documentati separatamente. Nessun cambiamento a formule, fiscalità, autorizzazioni, trial, vendite o PDF.
