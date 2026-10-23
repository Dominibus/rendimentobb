# RC193 — diagnosi prima dell’implementazione

Base: archivio utente `rendimentobb-main (27).zip`, 633 file; GitHub main verificato il 23/10/2026: `61264988631b8b52d751613b5a843720658c4acb`, caricamento RC192. Inventario: nessun AGENTS.md nell’archivio.

Componenti esistenti: roi-engine (ricavi turistici), mortgage-engine (rata annua), investment-assumptions (schema turistico chiuso), app/dashboard/Firestore (analisi account), PMS operativo e demo, chatbot-orchestrator, public-shell, pagine tool/immobili, sitemap. Riutilizzo: solo mortgage-engine e shell pubblica. Nessuna importazione del ROI turistico, del PMS o dello schema Firestore nel nuovo modello.

Decisione MVP: pagina pubblica IT/EN con dati in memoria e motore puro dedicato. Un anno civile per simulazione, stanze, fasce personalizzabili, giorni di apertura, contratti inclusivi, chiusure, tariffa mensile stanza/intervallo settimanale oppure per utilizzo. Modello misto semplice consentito su spazi non sovrapposti. Nessuna persistenza, API nuova, migrazione o funzione commerciale promessa dai piani.

Contratto dati: `schema: commercial-property-v1`; anno; property (owned/purchase, valore/prezzo, spese, lavori, altro capitale, nuovo prestito/rata, debito residuo/rata); costs (fissi annui, variabili % sul ricavo senza IVA); openDays ISO; slots (id/start/end); rooms (id); assignments (id, roomId, code generico, mode, weekdays/slotIds, start/end, amount comprensivo dell’eventuale IVA, vat status/rate, expectedPct); closures (roomId o *, start/end). Non scritto nelle collezioni esistenti.

Rischi: ambiguità tariffa; scorporo IVA improprio; sovrapposizioni; mesi parziali; chiusure versus canone fisso; valore già posseduto versus capitale nuovo; uso di vecchi valori chatbot. Contromisure: scelte esplicite, risultati netti N/A con IVA ignota, calendario UTC, validazione collisioni, prorata giornaliera documentata dei mesi parziali, motore indipendente, risposta chatbot di perimetro senza leggere account.

Piano test: baseline completa dopo predisposizione dipendenze locali; prove indipendenti 305 mensile/per uso, IVA, anno bisestile, date invalide, contratti e chiusure, sovrapposizioni, debito vecchio/nuovo, zero/N/A, margini negativi, scenari, UI eventi IT/EN e regressione completa. Verifica statica di link/caching/assenza storage. Non dichiarare test visuali o di mercato reali.
