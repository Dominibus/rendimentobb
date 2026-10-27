# Audit finanziario indipendente e commerciale

Data: 27 ottobre 2026. Checkout letto: `/workspace/rendimentobb`. Nessun file applicativo modificato. Riproduzioni: `node /workspace/audit-rendimentobb/financial-probes.mjs`. Risultato effettivo: **638 asserzioni indipendenti passate**, oltre a due sonde diagnostiche che mostrano difetti. Queste 638 asserzioni non sono 638 test del runner Node e non vanno sommate al conteggio della suite applicativa.

## Metodo e limiti

Sono stati letti i motori ROI, mutui, commercial-property, commercial-activity-plan, commercial-workspace-model, investment-assumptions, financial-review, portfolio-kpi, mortgage-quotes, score-engine e i punti d’ingresso pertinenti di app.js e tool/index.html. Test effettuati solo con dati sintetici e moduli puri locali. Nessuna sessione reale, nessuna scrittura Firestore o servizio esterno. I precedenti audit sono stati consultati solo per orientarsi, non usati come prova di correttezza. La catena browser salva→rilegge→dashboard→PDF non viene dimostrata da questo controllo: richiede il lavoro trasversale e la verifica browser del rapporto generale.

La verifica numerica usa una somma indipendente dei flussi attualizzati di ogni rata e, per casi numericamente stabili, un saldo residuo aggiornato mese per mese. Per i tassi elevati su 40 anni la ricorrenza del saldo ha cancellazione numerica, per cui il controllo indipendente decisivo è il valore attuale della rendita; non si attribuisce al motore un errore introdotto dal verificatore. I casi ROI costruiscono ricavi, costi e imposte direttamente dalle equazioni, senza richiamare funzioni interne del motore per il valore atteso.

## Formule effettive B&B

Fonte principale `js/roi-engine.js:42-125`.

| Indicatore | Formula applicata | Valutazione |
|---|---|---|
| Notti | 365 × occupazione/100 | Coerente per anno convenzionale; non stagionale né bisestile |
| Ricavi | ADR × notti | Coerente; non include automaticamente pulizie/addebiti separati |
| Commissioni | ricavi × commissione/100 | Coerente con base lorda dichiarata |
| Costi operativi | mensili ×12 oppure ricavi × % esplicita | Unità esplicita: non inferita dall’importo |
| NOI | ricavi − commissioni − costi operativi | Corretto come NOI semplificato per i costi effettivamente inseriti |
| Cap rate | NOI/prezzo ×100 | Corretto; N/A segnalato tramite propertyROIAvailable se valore nullo |
| Imposta simulata | max(NOI,0) × aliquota/100 | Regola matematica coerente, **non** calcolo fiscale italiano certificato |
| Servizio debito | 12 × rata capitale+interessi | Corretto ammortamento standard, TAN nominale/12 |
| Cashflow annuo | NOI − imposta simulata − servizio debito | Corretta distinzione tra cassa e utile contabile |
| Cashflow mensile | annuo/12 | Corretto; media convenzionale, non previsione mensile stagionale |
| `roi` | cashflow/equity ×100 | È cash-on-cash dopo rata e imposta del modello; non ROE contabile completo |
| `realROI` | cashflow/prezzo ×100 | È rapporto cassa/prezzo, diverso dal cap rate; nome interno ambiguo |
| DSCR | NOI/servizio debito | Corretto DSCR pre-fiscalità; con debito nullo il valore interno 0 deve essere visualizzato N/A |
| LTV | prestito/prezzo ×100 | Corretto, applicability flag presente per denominatore nullo |
| `breakEvenYears` | equity/cashflow positivo | Payback semplice a flussi costanti, non VAN/TIR, né occupazione di pareggio |

La semantica è esplicitata in `js/financial-review.js:19-41`: rate comprendono capitale, fiscalità simulata sul margine positivo, costi iniziali/acquisto/lavori/straordinari/chiusure e stagionalità non inclusi automaticamente. Questo è un pregio verificato del codice, non una certificazione della comprensione dell’utente.

`js/investment-assumptions.js:57-71` ricava correttamente il ricavo lordo di pareggio: se m=1−commissioni−costi percentuali, F=costi fissi e D=debito, il ricavo è (F+D/(1−t))/m nel caso fiscalità <100%; gestisce assenza di soluzione e debito nullo. `financial-review.js:8-10` converte in occupazione dividendolo per ADR×365 e tratta il risultato >100% come non raggiungibile.

## Prove numeriche eseguite

- Mutui: capitali 10.000/120.000/450.000€, TAN 0, 1e−12, 3,5, 12, 100%, durate 1/20/40 anni. Rata, valore attuale, interessi totali verificati. Zero interessi = capitale/durata annua. Le funzioni `log1p`/`expm1` evitano la perdita di precisione vicino a zero.
- ROI: prezzo 0/100.000/300.000€, equity 0/20.000€, occupazione 0/10/65/100%, costi 0/500/3.000€ mensili, prestito 100.000€ a tasso zero per 20 anni. Verificati ricavi, NOI, servizio del debito, cashflow annuo/mensile, ROI equity e DSCR: 3×2×4×3=72 scenari, 7 identità =504 asserzioni; le restanti 134 coprono mutui e commerciale. Il totale stampato dallo script è 638.
- I risultati negativi restano negativi; le divisioni per zero nei casi validi hanno guardie. Equity zero produce roiAvailable=false, senza ROI infinito.
- Immobile posseduto: il motore non inventa un prezzo se assente; mantiene distinto il capitale di avvio. Nello schema commerciale un asset già posseduto non costituisce nuovo esborso.
- La UI acquisto verifica equity≤prezzo (`js/app.js:3631-3645`) e ricava prestito=prezzo−equity (`3713-3722`); le ipotesi salvate rifiutano valori non finiti e percentuali fuori intervallo (`investment-assumptions.js:5-15`). Non confondere quindi le sonde dirette del motore riportate sotto con un bypass della UI già provato.

## Difetti confermati

### FIN-01 — P2: contratto estraneo all’anno rende N/A i totali annuali commerciali

- File: `js/commercial-property-engine.js:102-110`, propagazione a `115-124`; confronto `js/commercial-activity-plan.js:14-24`.
- Atteso: un contratto senza alcuna competenza nell’anno non modifica ricavi netti, margine e cassa di quell’anno. Se l’IVA è ignota e l’importo di competenza è esattamente zero, l’incertezza non incide sui totali.
- Osservato: base 2027, contratto mensile 305€ IVA22%, costi 2.400€: expectedNet=3.000€, cashflow=600€. Aggiungendo un secondo contratto attivo solo nel 2028 con IVA unknown: units=0, contractualGross=0, ma expectedNet annuale=null e cashflow=null. Il piano mensile 2027 mantiene invece 3.000€ netti sommati. Difetto di coerenza annuale/mensile riprodotto nello script.
- Causa confermata: le righe annuali includono tutti i contratti e assegnano null all’imponibile quando IVA unknown anche per competenza nulla; sumKnown propaga null. Il piano mensile filtra prima i contratti per intervallo.
- Impatto: risultati e redditività non disponibili pur senza incertezza economica nell’anno; non altera un saldo registrato, non prova perdita dati.
- Soluzione proposta: definire il contributo numerico di competenza nulla come zero, oppure escludere i contratti non pertinenti dall’aggregazione annuale preservando l’inventario; mantenere null per un importo rilevante con IVA ignota.
- Test richiesto: contratto fuori anno unknown; per-use interamente chiuso; expectedPct zero; assicurare ancora N/A per unknown con ricavi >0 e riconciliare somma mensile/annuale.
- Non applicare automaticamente: modifica la semantica dei risultati finanziari; la richiesta utente prescrive proposta tecnica per questi cambi.

### FIN-02 — P2: il motore ROI silenzia input non validi con risultati economici apparentemente regolari

- File: `js/roi-engine.js:12-19,36-40,73-80,179-180`; guardia debito in `js/mortgage-engine.js:18-25`.
- Riproduzione A: calculateROI({price:200000,equity:50000,loanAmount:150000,loanYears:0}) restituisce servizio debito=0. Un prestito dichiarato può così apparire gratuito per i chiamanti che non validano la durata.
- Riproduzione B: prezzoNotte=Infinity passa safePositive; i valori non finiti vengono ripuliti a zero all’uscita, ma il calcolo del rischio è già avvenuto. Con prezzo200k/equity50k/prestito150k restituisce ricavi0, NOI0, servizio debito10.439,27€, cashflow0 e rischio23. Le identità economiche dei valori restituiti sono false (0−0−10.439,27 ≠0).
- Causa confermata: Number/isNaN accetta Infinity e null come numero; clean non finito→0 nasconde lo stato invalido. calculateMortgage restituisce 0 per durata invalida senza distinguere assenza debito da errore.
- Impatto dimostrato: contratto del modulo puro fragile e potenziale errore nei futuri chiamanti/import. **Non è dimostrato un percorso normale della UI che produca Infinity o durata zero**: HTML e lettore snapshot hanno guardie. Non presentarlo come errore finanziario P0/P1 nei casi validi.
- Soluzione proposta: validazione esplicita finita a confine, errore strutturato/inapplicabilità anziché sostituire flussi incoerenti con zero; nessun cambio arbitrario di formule. Test di identità sui campi restituiti, malformed/Infinity/null, durata zero con debito>0.
- Non applicare automaticamente perché cambierebbe il contratto del motore per input invalidi.

## Caso poliambulatorio: 305€ IVA compresa

Il modello non calcola prestazioni mediche; tratta codici generici di conduttori, stanze e fasce (`commercial-property-ui.js:66-78`). Numero stanze≤30, fasce≤12/giorno, assegnazioni≤120; giorni/orari sovrapposti e contratti in collisione vengono rifiutati. La capacità è numero di fasce, **non ore**: durate diverse non sono percentuali di utilizzo orario, esplicitato in UI riga62.

La frase «305€ per mezza giornata settimanale» ha due possibili basi contrattuali, che la UI impone di distinguere:

| Base scelta | Calcolo 2027 per lunedì AM | Lordo annuo | Netto IVA22% |
|---|---|---:|---:|
| Canone mensile per pacchetto di fasce settimanali | 305×12 | 3.660€ | 3.000€ |
| 305€ per singolo utilizzo effettivo di una fascia | 305×52 lunedì | 15.860€ | 13.000€ |

La prima non va moltiplicata di nuovo per 52/12; la seconda non va trattata come canone mensile. Entrambi i risultati sono stati verificati con asserzioni. Se il contratto intendesse invece un canone settimanale indipendente dall’effettivo calendario, quella unità non esiste esplicitamente: serve una definizione contrattuale/proposta separata, non inferenza automatica.

IVA: divisore 1+aliquota; 305/1,22=250€ e IVA55€. `unknown` mantiene N/A per imponibile, margine e cassa quando vi sono ricavi, evitando di inventare un regime. `no_vat` è un’ipotesi scelta dall’utente, non una conclusione di esenzione normativa. Il modello esclude imposte sul reddito e non recupera automaticamente IVA sui costi; la UI lo dichiara a riga55. Professionista fiscale/legale deve verificare natura locazione/servizi/concessione periodica, aliquota/esenzione, detraibilità, fatturazione, abilitazioni e destinazione d’uso; nessuna conclusione normativa è attestata dall’audit.

Ricavi attesi = contrattuali×expectedPct, non incassi bancari. Costi variabili = % sull’imponibile atteso; costi fissi annuali; margine=netto−costi; cassa pre-imposte= margine−rate. Il ritorno sul capitale nuovo esclude correttamente il valore già posseduto dall’esborso e presenta N/A per equity nuova nulla. Il debito residuo esistente non finanzia automaticamente nuovi lavori. Mancano un piano temporale degli esborsi iniziali, indice DSCR commerciale esplicito e variazioni contrattuali indicizzate; sono limiti di prodotto, non errori provati nelle equazioni attuali.

I canoni mensili proseguono durante le chiusure, i per-use no (`commercial-property-engine.js:89-106`): regola esplicita in UI riga78, da verificare sul contratto reale. La previsione mensile è pro-rata di giorni di validità nel mese. Il workspace commerciale distingue competenza, incasso netto rimborsi e cassa per data effettiva (`commercial-workspace-model.js:86-98`); movimenti in centesimi interi, limiti, annullamenti tracciati e rimborsi non superiori agli incassi sono presenti nel codice. Questo non prova integrazione bancaria, fiscale o qualità contabile completa.

## Score, rischio e utilità professionale

`js/roi-engine.js:123-177`: rischio = base10 + soglie ROI equity + occupazione + leva + copertura + cashflow, limitato100. `js/chatbot/core/score-engine.js`: punteggio additivo con soglie, non modello statistico calibrato. La redditività/cashflow ricompaiono anche nel rischio: non sono segnali indipendenti. Alta occupazione ipotizzata migliora entrambi gli score, mentre può anche essere un’assunzione ottimistica da stressare. Non c’è evidenza di calibrazione su insolvenze/perdite o intervalli di confidenza. Le etichette «elite/sostenibile» non dimostrano bancabilità. Miglioramento ad alto valore: mostrare sensibilità a occupazione/ADR/costi e copertura delle ipotesi prima di una graduatoria; mantenere distinzione score interno vs probabilità.

Il portafoglio ha sia media aritmetica ROI sia rendimento pesato cashflow totale/equity totale (`portfolio-kpi.js:9-27`); include correttamente la cassa degli immobili finanziati100%, e non inventa totali completi quando mancano valori. Le due metriche hanno scopi diversi: la UI deve continuare a distinguerle.

VAN/TIR non risultano implementati nei moduli finanziari esaminati. Sarebbero utili solo insieme a flussi pluriannuali completi (acquisto/oneri, lavori, reinvestimenti, ammortamento capitale, vendita/costi di uscita, imposte e tasso di attualizzazione esplicito). Aggiungere un numero TIR a un anno statico senza uscita peggiorerebbe la qualità. Priorità: completezza costi e sensibilità; dopo validazione professionale, schema cashflow pluriennale e VAN/TIR su quel contratto.

## Valutazione limitata all’area esaminata

- Calcoli finanziari **7/10 nel perimetro semplificato documentato**: formule standard valide nei casi verificati, unità esplicite, guardie ROI zero e distinzioni NOI/cassa; limiti iniziali/temporali/fiscali e difetti FIN-01/02 impediscono una valutazione da strumento professionale completo.
- Modello commerciale **7/10 per simulazione di spazi e fasce**, non per gestione clinica, fatturazione o contabilità certificata.
- Non attribuisco voti a UX reale, sicurezza complessiva o prontezza professionale generale da questo controllo parziale.

Prossimi test manuali: stessa fixture 305€ in IT/EN; anno2027/2028; due stanze e slot diseguali; contratto parziale/chiusura; IVA unknown/no_vat/22%; annuale vs12mesi; conferma workspace e movimento sintetico/rimborso; persistenza e revisione concorrente solo nell’emulatore o progetto di test autorizzato. Confrontare dati, etichette e arrotondamenti, non soltanto presenza dei KPI.
