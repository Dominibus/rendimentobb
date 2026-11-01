# Evoluzioni proposte, non implementate

## Percorso iniziale

La home resta invariata. In una PR separata proporre due ingressi:

- «Sto valutando un investimento»: candidati → criteri → verifiche → Analizza → eventuale salvataggio con il flusso attuale.
- «Gestisco già immobili»: Dashboard/PMS, senza confondere candidati con proprietà operative.

Prima verificare etichette e comprensione con utenti, mobile e tastiera. Nessuna promessa di investimento migliore o traffico.

## Persistenza e confronto economico multiplo

Un elenco salvato nell'account richiede contratto dati, quote, autorizzazioni, conservazione, versionamento e controlli di concorrenza: revisione separata. Non convertire automaticamente candidati in proprietà. L'eventuale provenienza delle nuove analisi segue la proposta A5 già documentata, senza riscrivere gli storici.

Confronti economici multipli potrebbero usare il motore canonico dopo controllo dei piani, input completi e ipotesi coerenti; occorre un contratto esplicito per risultati e versioni. Nessun nuovo investment score non validato. Questa PR delega il singolo calcolo al simulatore esistente.

## Portali e OMI

Nessuna integrazione attiva aggiunta. Per un portale specifico raccogliere prima autorizzazione, contratto/API consentita, licenza, costo e limiti, campi/versione, identità stabili e modalità di cancellazione/aggiornamento. No scraping o API a pagamento senza autorizzazione. Un link pubblico non autorizza acquisizione automatica.

Un contesto OMI per candidato richiede identità territoriale e zona confermata, semestre, tipologia/stato, unità e superficie compatibili. Non trasferire OMI o statistiche turistiche in prezzo notte, occupazione, costi o rendimento. Eventuale fonte/contratto da revisionare prima di costruire il connettore.

## Ulteriori esigenze UX

Valutare modifica di schede esistenti con conferma e identità immutabile, esportazione con protezione formule, confronto fra selezioni e indicatori di campi verificati. Il workspace attuale si ricarica vuoto: nessun recupero o archivio implicito. Un export completo e la gestione di liste oltre 50 righe richiedono disegno e verifica dedicati, non riattivazione silenziosa dei default.
