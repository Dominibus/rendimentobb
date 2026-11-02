# Domande composte sui PDF operativi

Base: main 511038cf0b3a14e232a61ca1dc8cf93706474bb8.

Riproduzione browser prima della patch: una domanda su ricavi, occupazione e ADR del PDF andamento restituiva soltanto l'occupazione. Il riepilogo iniziale e le domande singole erano corretti.

La patch risponde a tutti gli indicatori operativi nominati nelle domande composte IT/EN: ricavi, occupazione, ADR, RevPAR, soggiorni, notti e scostamento. Se vengono chiesti anche indicatori finanziari effettivi o dati mancanti, conserva i valori operativi disponibili e dichiara i limiti. I valori assenti restano N/D e gli zeri restano zero. Il documento corrente rimane l'unica fonte; nessuna lettura di dati account aggiunta. Le spiegazioni delle domande singole e il routing finanziario dei report integrati restano separati.

Nessuna modifica a restrizioni Free/Investor/Pro, calcoli, record, Firebase, pagamenti o trial. Nessun dato del PDF dell'account nei test: fixture sintetica.

Aggiornato il riferimento cache del lettore e la sola impronta del suo sorgente censito, con versione registro e modulo browser derivato. L'aggiornamento documenta la modifica applicativa effettiva: nessun dataset, formula o altra impronta cambiata.

Verifiche: 51 test mirati passati, incluse 9 nuove regressioni; 638 identità finanziarie passate. Suite completa locale da distinguere dalla CI: due file richiedono dipendenze firebase-admin e resend non disponibili nell'ambiente. Il collaudo browser della correzione resta da eseguire sulla nuova preview; quello precedente ha provato il caricamento, non questa modifica. Nessun merge o deploy manuale.
