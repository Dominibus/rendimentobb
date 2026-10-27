# Elenco preventivo patch

Registrato al completamento del rapporto diagnostico, prima di modificare codice.

Branch previsto: `audit/independent-20261027` dal commit `6cece488a4ff36b068498c29eb3a27ab6931c04a`.

1. tests/rc169-real-estate-focus.test.js
2. tests/rc174-audit-corrections.test.js
3. tests/rc189-linkedin-journeys.test.js
4. tests/rc190-free-value.test.js
5. tests/rc191-data-evidence.test.js
6. tests/rc193-commercial-ui.test.js
7. tests/rc194-six-profile-journeys.test.js
8. tests/rc207-commercial-shell.test.js
9. plans.html

Solo pin header/loader/orchestrator RC212; app e asset invariati conservano pin precedenti. Solo attributi traduzione avviso esistente piani. Nessun nuovo test speculare, dipendenza o modifica applicativa finanziaria. Eventuali test browser di verifica stanno fuori checkout.

PMS-01 richiede cambiare schema registro client: proposta separata per il vincolo esplicito sulle strutture dati. FIN-01/02 cambiano semantica/contratto finanziario: proposta separata. Nessun tentativo di correggerli semplicemente per ottenere suite verde.
