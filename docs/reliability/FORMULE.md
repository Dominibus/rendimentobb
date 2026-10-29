# Dizionario delle grandezze e delle ipotesi

Baseline main ad44c31; non nuova validazione fiscale. Il registro conserva l'impronta dei modelli. Questa scheda descrive i risultati del codice esistente, non modifica formule o default. Usare le unità dichiarate; mancante e non applicabile sono distinti dallo zero numerico interno di compatibilità.

| Grandezza | Definizione / unità / origine |
|---|---|
| Prezzo immobile, capitale proprio, prestito | Input utente in euro; acquisto e già posseduto sono scenari distinti. Prestito esplicito prevale sul prezzo−capitale; non è una concessione bancaria. |
| Prezzo notte, occupazione | Input €/notte e percentuale0–100; default e riferimenti città sono ipotesi interne, non dati ufficiali di domanda. |
| Notti simulate | 365×occupazione/100. Anno finanziario convenzionale365, non calendario contratti o capacità effettiva certificata. |
| Ricavo lordo annuale | Prezzo notte×notti simulate, €/anno. |
| Commissioni | Ricavo×commissione/100; default15% ipotesi. |
| Costi annui | Costi mensili×12, oppure ricavo×percentuale/100 quando expensesUnit=percentage. Nessuna deduzione dell'unità dal numero. |
| NOI / margine operativo | Ricavo−commissioni−costi annui; €/anno, prima di imposta del modello e servizio debito. |
| Cap rate | NOI/prezzo×100; percentuale. Applicabile solo con prezzo/valore positivo. Non ROI sul capitale. |
| Imposta del modello | max(NOI,0)×tax/100; €/anno. Default21% non certifica regime o base imponibile del soggetto. |
| Rate annuali / annualDebtService | Rata mensile a TAN costante×12; include rimborso capitale e interessi, non spese sconosciute. |
| Cashflow annuale / netAfterMortgage | NOI−imposta del modello−servizio debito; €/anno, può essere negativo. |
| Cashflow mensile | Cashflow annuale/12; non stagionalità reale. |
| ROI equity | Cashflow/capitale proprio×100; N/A quando capitale zero, non rendimento0%. Flag roiAvailable governa applicabilità. |
| realROI del motore | Cashflow/prezzo×100; non cap rate, perché successivo a debito e imposta. Flag propertyROIAvailable richiede prezzo positivo. |
| LTV | Prestito/prezzo×100 prima degli arrotondamenti, applicabile con prezzo positivo. |
| DSCR modellato | NOI/servizio debito. Nessun debito: non applicabile, anche quando il campo numerico legacy contiene0. |
| Recupero capitale | Capitale/cashflow in anni se entrambi positivi; nessun payback positivo con cashflow nullo/negativo. Non sconta i flussi né presume valore di rivendita. |
| Margine percentuale | Cashflow annuale/ricavo×100 quando ricavo positivo. |
| Ricavo di pareggio | In investment-assumptions.js: margine unitario m=1−commissione−costi percentuali; costo fisso F=costi mensili×12. Ricavo necessario=(F+debito/(1−tax))/m con debito positivo, F/m senza debito. Percentuali espresse come frazioni. Casi senza soluzione finita null; leggere i controlli su m≤0 e tax=100. |
| Occupazione di pareggio | Ricavo necessario/(prezzo notte×365)×100, oppure null se non determinabile. Può superare100%, segnalando scenario non sostenibile nelle ipotesi. |
| Scenari prudente/favorevole | financial-review.js: occupazione±10 punti limitata0–100 e prezzo notte×0,9/1,1. Sono stress test interni, non previsione probabilistica. |
| PMS notti | Giorni tra checkin incluso e checkout escluso; date valide e stato attivo, proprietà selezionata. |
| PMS ricavo di periodo | Totale soggiorno ripartito uniformemente per notti pertinenti, nessuna stagionalità ricostruita. Dato dichiarato, non incasso verificato. |
| PMS occupazione | Notti occupate uniche/notti disponibili×100. Nel report standard una unità per proprietà/giorno, non camere multiple o chiusure. Sovrapposizioni segnalate. |
| PMS ADR / RevPAR | Ricavo periodo/notti prenotate; ricavo periodo/notti disponibili. Non il prezzo pubblicizzato Inside Airbnb. Importi mancanti non stimati. |
| Performance attesa | Ricavo annuo della simulazione collegata×frazione del periodo nel rispettivo anno, senza stagionalità; confrontabile solo se collegamento e dati completi. |
| Commerciale canone | Importo contrattuale×utilizzi o frazione mensile, in base al tipo contratto e calendario. Realizzo atteso=lordo×expectedPct/100; IVA ignota rende il netto non determinabile. |
| Commerciale rendimento | Resa lorda/netta operativa su valore immobile e ritorno su nuovo capitale sono denominatori distinti. Cashflow economico=netto atteso−costi−debito; nessuna imposta sul reddito automaticamente determinata. |

## Rischio composito e score sono due modelli interni distinti

Il rischio in roi-engine.js somma una base 10 e penalità, con massimo 100:

- ROI: non applicabile0; ROI<0→25, <6→20, <10→15, <15→10, <20→5, altrimenti0.
- Occupazione: <45→20, <55→15, <65→10, <75→5, altrimenti0.
- Leva: nessun debito0; prezzo non positivo10; LTV≥80→10, ≥70→8, ≥60→5, altrimenti2.
- Copertura debito: nessun servizio0; DSCR<1→20, <1,2→15, <1,5→10, <2→5, altrimenti0.
- Cashflow annuale: <0→10, <2.400→6, <6.000→3, altrimenti0.

Lo score in js/chatbot/core/score-engine.js parte da 50 e aggiunge contributi:

- ROI: non applicabile0; ≥30 +25; ≥20 +18; ≥10 +10; >0 +2; altrimenti−15.
- Rischio: ≥80 −25; ≥60 −15; ≥40 −6; altrimenti+8.
- Occupazione: ≥75 +18; ≥60 +12; ≥45 +4; >0 −12; zero nessun contributo.
- Leva: ≥90 −20; ≥80 −12; ≥60 −5; >0 e≤40 +4; altri casi0.
- Cashflow annuale: >50.000 +15; >15.000 +8; >0 +3; altrimenti−18.

Arrotonda e limita lo score 0–100. Etichette:≥90 elite, ≥75 strong, ≥60 good, ≥40 moderate, altrimenti weak. Sono classificazioni euristiche del prodotto, non merito creditizio, probabilità, perizia o consiglio fiscale. I verdetti Autopilot hanno ulteriori regole contestuali: consultare il relativo file e non dedurre il verdetto storico dal solo score corrente. I dati incompleti devono restare tali prima di invocare il motore.

## Riferimenti di contesto

Le schede del registro e i JSON originali definiscono unità, territorio, periodo e metodo per ISTAT/OMI/annunci. La loro presenza non modifica questi calcoli e non valida gli input del singolo immobile. Una nuova formula o soglia richiede revisione e versione separata.
