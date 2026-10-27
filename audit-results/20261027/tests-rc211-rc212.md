# Indagine riproducibile RC211 / RC212

Base: `6cece488a4ff36b068498c29eb3a27ab6931c04a` (RC212), precedente `c408e9092a134b916948dc3d5374aa45cbcd6cb7` (RC211).

Suite originale: 2.034 test eseguiti, 2.023 passati, 11 falliti, nessuno skipped/cancelled. I medesimi otto file estratti dal commit precedente passano **209/209 test**. Primo tentativo del confronto dentro il sandbox mostrava soltanto otto file; non è stato accettato come prova: la riesecuzione autorizzata fuori sandbox ha contato i 209 test effettivi.

| Test e posizione baseline | Esito | Causa verificata | Gravità / soluzione |
|---|---|---|---|
| `tests/rc169-real-estate-focus.test.js:36:1` — demos, real-estate modules and sales pause remain available | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc174-audit-corrections.test.js:108:1` — entry points and nested modules invalidate cached versions of changed assets | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc189-linkedin-journeys.test.js:55:1` — RC189: changed modules and loader entry points have matching cache versions | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc190-free-value.test.js:63:1` — RC190: loader orders the Free presentation before UI with fresh versions | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc191-data-evidence.test.js:60:1` — RC191 market evidence dependencies load before the response engine | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc193-commercial-ui.test.js:72:1` — RC193 parent cache references updated without changing unrelated engines | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc194-six-profile-journeys.test.js:28:1` — RC194 cache chain uses current shared assets and unchanged commercial engine | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc207-commercial-shell.test.js:8:160` — RC207 common account header and footer on immobili-commerciali/index.html | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc207-commercial-shell.test.js:8:160` — RC207 common account header and footer on en/immobili-commerciali/index.html | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc207-commercial-shell.test.js:8:160` — RC207 common account header and footer on gestione-commerciale/index.html | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |
| `tests/rc207-commercial-shell.test.js:8:160` — RC207 common account header and footer on en/gestione-commerciale/index.html | Fallito | Atteso `20261027-rc211` per header/loader/orchestrator aggiornati a RC212 | P2: correggere soltanto le aspettative degli asset effettivamente modificati |

## Interpretazione della catena cache

`header.js`, `chatbot-loader.js` e `chatbot/core/chatbot-orchestrator.js` sono cambiati nella patch RC212 e i riferimenti di ingresso sono stati aggiornati a `20261027-rc212`. `app.js`, `market-engine.js`, `free-home-snapshot.js` e `chatbot-ui.js` non sono cambiati nella RC212 e conservano correttamente RC211. Footer RC196, moduli commerciali RC207 e parser PDF RC200 non devono essere rinumerati indiscriminatamente.

La RC212 ha anche corretto il routing delle domande informali sui KPI e separato rendimento operativo da cassa/prezzo nel report. I test RC212 presenti nella suite verificano tali comportamenti e passano. Il diff del commit e il confronto parent dimostrano una regressione nella manutenzione dei test, non un errore finanziario causato dai suffissi cache. Nessun problema di persistenza o isolamento dati è dimostrato da questi 11 fallimenti. Eventuali service worker/CDN o cache del deployment reale non sono stati testati.

## Riproduzione

Dalla radice: `npm test`. Log originale: [node-before.log](evidence/node-before.log), record strutturato: [failing-tests.json](evidence/failing-tests.json), confronto precedente: [rc211-parent-comparison.log](evidence/rc211-parent-comparison.log).

## Patch proposta prima delle modifiche

Solo otto file test: rc169-real-estate-focus, rc174-audit-corrections, rc189-linkedin-journeys, rc190-free-value, rc191-data-evidence, rc193-commercial-ui, rc194-six-profile-journeys, rc207-commercial-shell. Sostituire i pin di header/loader/orchestrator, preservare quelli degli asset non modificati. Il loop rc174 deve distinguere app RC211 da header/loader RC212. Conservare asserzioni e conteggio, senza skip né allentamento delle regex.
