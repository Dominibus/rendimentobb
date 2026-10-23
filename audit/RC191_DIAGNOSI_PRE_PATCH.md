# RC191 — Diagnosi e priorità prima delle modifiche

Base: archivio caricato rendimentobb-main (26).zip, identico alla RC190 locale. Main GitHub rilevato: 709009cc1e7f28b1403d8e20e39fe602c02598e9 (ultimo caricamento RC190). Nessuna modifica remota prevista. Suite di base: 1642 test superati.

| ID | Priorità | Natura | Evidenza nel codice | Intervento previsto |
|---|---|---|---|---|
| B01 | P1 | Ambiguità verificata | RB_MARKET_DATA, marketData e rbMarketData hanno ipotesi statiche differenti; assenti fonte, periodo, zona, tipologia e capienza | Metadati espliciti e avvertenza nel punto d'uso; riferimenti C, non D |
| B02 | P2 | Arrotondamenti statici non dichiarati | I ricavi annui statici della tabella principale non coincidono con prezzo × 365 × occupazione | Mostrare un ricavo calcolato B dalle ipotesi C, conservando i vecchi valori per compatibilità dei dati e documentando il cambiamento del solo confronto |
| B03 | P1 | Bug/ambiguità verificata | getPricingMarket restituisce il riferimento italy anche per una località assente | Rimuovere la sostituzione geografica silenziosa; nessun dato di città inventato |
| B04 | P2 | Ambiguità verificata | Pricing PMS: blend 70/30, mesi automatici e fattori non spiegati nel punto numerico; dicitura Rilevata | Esporre ipotesi, peso e regola mensile; formule per località riconosciute conservate |
| B05 | P1 | Ambiguità verificata | Chatbot usa anche tabelle narrative statiche con ROI medi, bestAreas e affermazioni di domanda non documentate | Risposta di provenienza prima dei percorsi di mercato legacy, mantenendo priorità PDF, account e piani |
| B06 | P2 | Ambiguità verificata | PDF tool/dashboard spiegano la natura interna ma non zona, tipologia, capienza e periodo con pari dettaglio | Estendere il chiarimento nei punti di confronto, senza inventare fonti |
| B07 | P2 | Errore di unità verificato | Dashboard: avgROI - marketROI mostrato con % invece che punti percentuali | Correggere unità ed evitare giudizio di sovraperformance da basi non comparabili |
| B08 | P2 | Limite di modello verificato | PMS: capacità = numero proprietà × giorni, nessun modello di chiusure/camere collegate | Esplicitare denominatore e riparto uniforme in UI, PDF e CSV; non inventare disponibilità effettiva |
| B09 | P2 | Ambiguità verificata | Risk e Investment Score basati su soglie interne deterministiche | Rendere esplicito che non sono probabilità, certificazioni o predizioni di mercato |
| B10 | P2 | Compatibilità verificata | Vecchi dati salvati e PDF non conservano evidenze di mercato verificato | Classificare riferimenti legacy come non documentati senza migrazioni o scritture |
| B11 | P3 | Codice legacy/non dimostrato attivo | ui-engine.js contiene rischio 100 - ROI ma renderExecutiveKPI è solo importato in app.js; property-database.js non ha consumer individuati | Inventariare come codice legacy, non dichiarare errore nel risultato attuale senza un percorso riprodotto |

Nessun P0 dimostrato in questa fase. Non equivale a una certificazione di sicurezza.

## Confini e impatto

Non cambiare roi-engine, mortgage-engine, scoring, regole o contratti. Nessuna modifica ai record esistenti. Il ricavo di riferimento visualizzato cambia perché viene derivato dalle ipotesi ADR/occupazione del riferimento; i risultati della simulazione dell'utente restano invariati. Per località PMS non riconosciute il pricing non userà più la falsa sostituzione Italia: manterrà la base immobile/soggiorno o la base illustrativa 120 già prevista. Documentare tali effetti e provarli con regressioni.

CSV localizzati: eventuali metadati metodologici solo in colonne aggiuntive in coda. Schema legacy senza parametro lingua conservato. Non cambiare l'importazione prenotazioni o i file dati reali.

Verifiche finali previste: matrice finanziaria indipendente, confronto PMS su mesi confine/cancellazioni/portfolio/indisponibilità non modellata, contenuto e impaginazione PDF campione, CSV IT/EN e legacy, routing chatbot e suite completa. Browser solo pubblico; nessuna scrittura account o produzione.
