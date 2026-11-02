# Invalidazione delle richieste PMS dopo transizioni temporanee

Base main: 64349535ccafe90c8ff5b7a338af4c141c862855. Correzione candidata del P2 segnalato dal riesame indipendente della PR #16.

Il confronto finale di UID e filtro non rilevava A → B → A durante un refresh. Il lettore ora conserva una revisione del contesto; le assegnazioni canoniche di account, proprietà e filtro in firebase-init/dashboard emettono un evento sincrono prima della modifica. Qualunque evento durante l'attesa invalida la risposta anche se i valori finali coincidono. L'evento non contiene dati o identificativi, non modifica permessi o autenticazione e non esegue scritture. Le assegnazioni ripetute possono invalidare conservativamente una richiesta. Non sono intercettate scritture arbitrarie di estensioni o console al di fuori dei punti applicativi.

Il controllo finale di identità, accesso, completezza e filtro resta presente. Dopo invalidazione non vengono restituiti fatti o azioni; è richiesta una nuova domanda. Dati PDF, calcoli, trial, vendite e restrizioni dei piani invariati. Nessun record modificato.

Verifiche: sei nuove riproduzioni asincrone sospendono il refresh e applicano filtro A-B-A, account A-B-A o logout-A, con snapshot completo e invalidato. Senza il controllo della revisione falliscono tutte e sei; con la correzione passano. Un controllo aggiuntivo verifica che ogni assegnazione canonica censita emetta l'evento prima della modifica. Il vecchio harness dell'ordine delle risposte riceve Event/dispatchEvent del browser senza cambiarne le asserzioni.

120 test professionali passati. CI, revisione indipendente e browser Firebase reale ancora da eseguire; le sequenze account/logout simulate non dimostrano fuga dati fra account. Nessun merge o deploy manuale.
