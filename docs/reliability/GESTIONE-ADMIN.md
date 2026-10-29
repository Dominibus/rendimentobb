# La gestione quotidiana del fondatore — RC229

Questa modifica rende utilizzabili le evidenze esistenti. Non aggiunge connettori, cron, invii email, persistenza o permessi. Non modifica fonti, aliquote o motori finanziari.

## Cosa guardare entrando

1. **La tua gestione oggi** distingue anomalie operative, controlli non verificabili e revisioni delle fonti. Uno zero negli errori non nasconde le revisioni aperte.
2. **Devi intervenire tu** elenca i casi rilevati e i passi da seguire. Le istruzioni delle fonti si aprono su richiesta. Le revisioni già previste non sono presentate come nuovi incidenti.
3. **Cosa ha fatto il sistema** mostra ultima esecuzione, contatori reali e data delle sei attività già osservate. Email accettata dal provider non significa consegnata. È l'ultimo esito, non una cronologia completa.
4. **Dove ricevi gli avvisi** spiega se il digest email Admin esistente risulta abilitato e cosa non copre. I promemoria delle fonti sono visibili qui, ma non sono ancora inclusi nelle email.
5. **Dettagli tecnici e registro completo** rimangono consultabili, chiusi inizialmente. Le istruzioni aperte della lista principale restano aperte al ridisegno periodico e al cambio lingua; logout o errore rimuovono la vista come prima.

## Esempio OMI

La scheda chiede di aprire la fornitura ufficiale e confrontare il semestre disponibile con quello in uso. Non afferma che esista un nuovo semestre. Se una nuova fornitura è disponibile e utilizzabile, conserva archivio originale, periodo, data e condizioni d'uso e passa il materiale a Codex per un candidato verificabile, confronto e PR. Non caricare direttamente i file in main. Documentare anche le condizioni della fornitura già utilizzata.

Inside Airbnb richiede prima chiarimento del metodo/riuso consentito: ripetere un download non risolve il blocco. Guide e normativa richiedono revisione professionale; le ipotesi interne richiedono controllo del modello, non un download di dati di mercato.

## Esempio email

Se un job segnala errore o ritardo, premi Aggiorna controlli. Se permane, apri i log del progetto Vercel e annota attività, ora ed esito. Passa i dettagli a Codex senza segreti o dati personali superflui. Non reinviare alla cieca: il job può già avere accettato un invio. I contatori sono dell'esecuzione registrata, non totali storici.

## Cosa non viene ancora osservato automaticamente

Gli esiti dei workflow delle fonti non arrivano al pannello: i pulsanti aprono il workflow esatto su GitHub per leggere esito, data e artifact. Non compare un successo inventato. Collegare questi esiti ed estendere il digest email richiede un intervento server separato, con deduplicazione, limiti e test. Un cron fermo non può avvisare del proprio fermo.

La vista si aggiorna con “Aggiorna controlli”; il ridisegno locale non interroga i servizi. Dati oltre cinque minuti o con data inutilizzabile richiedono nuova lettura prima di decidere. Le revisioni diventano risolte solo dopo documentazione nel registro tramite PR: nessun pulsante “Fatto” certifica impropriamente i dati.

## Verifica e rilascio

Test mirati su quattro revisioni iniziali, scadenze, letture vecchie/future, anomalie deduplicate, controlli mancanti, zeri espliciti e testi/istruzioni IT/EN. Regressioni admin esistenti verificano accesso, logout e risposte tardive. Verificare il layout su preview Vercel con account admin prima del merge. Nessuna modifica in produzione autorizzata da questa PR.

Validazione locale: suite Node completa 2.174 test passati prima del test aggiuntivo sul ridisegno; 22 test mirati passati sul risultato finale, inclusi conservazione delle istruzioni aperte e logout. Integrità del registro e diff controllati. Verifica nel browser reale della nuova vista ancora da eseguire sulla preview.
