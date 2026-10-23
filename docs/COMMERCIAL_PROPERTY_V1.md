# Modello commerciale v1 — RC193

## Contratto e isolamento

Schema `commercial-property-v1`. Motore puro: `js/commercial-property-engine.js`. UI: `js/commercial-property-ui.js`. Pagina IT `/immobili-commerciali/`, EN `/en/immobili-commerciali/`. Nessuna scrittura Firestore, storage browser, API, anagrafica personale o caricamento documenti. Un modello per pagina; ricaricamento, navigazione o cambio lingua perdono i dati. Nessuna compatibilità implicita con `roi-monthly-v1`: non passare questo oggetto a saveAnalysis, dashboard, PMS, esportazioni o Autopilot esistenti.

```json
{
  "schema": "commercial-property-v1",
  "year": 2027,
  "property": {
    "ownership": "owned",
    "value": 240000,
    "acquisitionCosts": 0,
    "works": 18000,
    "otherCapital": 0,
    "newLoan": {"amount": 0, "rate": 0, "years": 20},
    "existingLoan": {"amount": 0, "annualService": 0}
  },
  "costs": {"fixedAnnual": 4800, "variablePct": 0},
  "openDays": [1, 2, 3, 4, 5],
  "slots": [
    {"id": "AM", "start": "09:00", "end": "13:00"},
    {"id": "PM", "start": "14:00", "end": "18:00"}
  ],
  "rooms": [{"id": "R1"}, {"id": "R2"}],
  "assignments": [{
    "id": "A1", "roomId": "R1", "code": "P01",
    "mode": "weekly_monthly", "weekdays": [2, 4], "slotIds": ["AM"],
    "start": "2027-01-01", "end": "2027-12-31",
    "amount": 600, "vat": {"status": "unknown", "rate": null},
    "expectedPct": 100
  }],
  "closures": []
}
```

Esempio di schema con valori fittizi, non valutazione dell’immobile del potenziale cliente. Nessuna fonte territoriale commerciale utilizzata. Gli scenari pubblici sono inventati per mostrare le diverse unità tariffarie, senza riprendere un caso di un cliente.

## Tipi e limiti

- Numeri veri, finiti e non negativi; stringhe vuote e NaN rifiutati, non convertiti in zero dal motore. Anno intero 1900–2100. Date ISO reali inclusive, calendario UTC indipendente dall’ora legale.
- `ownership`: owned o purchase. `value`: valore economico posseduto oppure prezzo di acquisto. `acquisitionCosts`: solo purchase; owned richiede zero. `works` e `otherCapital`: nuove spese a carico dell’utente, senza detrazioni IVA automatiche.
- `newLoan`: importo nuovo, tasso nominale annuo % esplicito 0–100, durata 1–60 anni; rata annua equivalente a 12 rate mensili. Nessuna carenza/preammortamento, erogazione parziale o rimborso anticipato. Finanziamento non superiore alle nuove spese. Zero ammesso; durata valida richiesta anche quando importo zero.
- `existingLoan`: capitale residuo e servizio annuo dichiarato, entrambi zero oppure entrambi positivi; ammesso solo owned. Non riduce il nuovo capitale da investire. Nessuna stima automatica della rata sul debito residuo.
- `fixedAnnual`: costi fissi per tutto l’anno di analisi, anche con contratti brevi. Inserire gestione, manutenzione, assicurazioni, eventuali imposte sull’immobile e altre uscite operative pertinenti. `variablePct`: quota 0–100% dei ricavi attesi senza IVA. Nessuna liquidazione IVA o calcolo delle imposte sul reddito.
- `openDays`: giorni ISO unici 1=lunedì … 7=domenica, almeno uno. `slots`: 1–12 intervalli nello stesso giorno, orari HH:MM, non sovrapposti. Intervalli adiacenti ammessi. Durate diverse ammesse: capacità e utilizzo misurano il numero di fasce, non ore equivalenti.
- `rooms`: 1–30 ID unici. `assignments`: fino a 120, ID unici e codice generico per raggruppamento economico. ID/codici: lettere ASCII, numeri, trattini o underscore, massimo 32 caratteri. Nessun campo note sanitarie o nominativo.
- `mode`: scelta esplicita tra room_monthly, weekly_monthly, per_use. Importo massimo 10 milioni per unità, comprensivo dell’eventuale IVA.
- room_monthly riserva tutte le fasce nei giorni aperti. Altri modelli richiedono giorni aperti e fasce esistenti. Più fasce/giorni nel modello weekly_monthly costituiscono **un pacchetto al prezzo mensile inserito**, non canoni singoli moltiplicati.
- `expectedPct`: 0–100%; ipotesi di quota realizzata rispetto al ricavo contrattuale, per non utilizzo, mancata locazione o realizzo. Non è una prova di incasso. La stessa quota pondera l’utilizzo atteso, aggregato orientativo e non registro di presenze.
- `vat.status`: unknown, taxable o no_vat. taxable richiede `rate` numerica esplicita 0–100; nessuna aliquota precompilata. Negli altri stati `rate:null`. no_vat è un’ipotesi matematica di nessun addebito IVA, **non una certificazione di esenzione o esclusione**.
- `closures`: fino a 100 intervalli di giorni interi, roomId stanza oppure `*`. Le chiusure sovrapposte non vengono conteggiate due volte. Nessuna chiusura parziale di una fascia o festivo implicito.

## Calendario, contratti e ricavi

Analisi limitata all’anno civile scelto. Contratti estesi oltre l’anno vengono intersecati con il periodo; quelli completamente esterni producono zero ricavi nell’anno. Anche le collisioni sono controllate **solo entro l’anno selezionato**: cambiare anno richiede una nuova validazione; la UI lo dichiara. Non presentare il calendario come registro contrattuale completo pluriennale.

Ogni stanza/giorno aperto/fascia è una unità di capacità. Le chiusure la rimuovono. Un contratto occupa le unità corrispondenti; due contratti che riservano la stessa unità sono rifiutati anche durante una chiusura. Una stanza mensile intera non può quindi sovrapporsi a una fascia ricorrente della stessa stanza. Capacità libera = capacità − fasce riservate. Utilizzo riservato = riservate / capacità. A capacità zero, percentuali N/A.

Per utilizzo: `corrispettivo contrattuale = amount × numero di singole fasce contrattualizzate a calendario e non chiuse`. Non moltiplicare per settimane convenzionali.

Mensile stanza/pacchetto: `corrispettivo contrattuale = amount × somma delle frazioni mensili`. Per ciascun mese, frazione = giorni inclusivi di contratto entro il mese / giorni reali del mese. Mesi interi valgono 1, indipendentemente da 4 o 5 ricorrenze. Le chiusure **non sospendono i canoni fissi**; eventuali sospensioni richiedono contratti separati non sovrapposti o modifica delle date. Questa è un’ipotesi economica dichiarata, non interpretazione legale di un contratto.

`corrispettivo atteso = contrattuale × expectedPct / 100`.

Per VAT taxable: imponibile = corrispettivo / (1 + rate/100), quota IVA = corrispettivo − imponibile. Per no_vat: ricavo = corrispettivo. Per unknown: ricavi senza IVA N/A e aggregati netti N/A se anche un solo contratto ha IVA ignota; non si mostra un totale parziale come completo. È una politica prudente anche con importo zero o contratto fuori periodo. Corrispettivi lordi e capacità restano visibili.

Esempio **puramente aritmetico**, con aliquota 22% inserita volontariamente e non suggerita come regime applicabile:

| Scenario fittizio 2027, nessuna chiusura | Eventuale IVA inclusa | Senza IVA con aliquota 22% scelta per la sola prova |
|---|---:|---:|
| Intera stanza: 1.200 €/mese, 12 mesi | 14.400 € | 11.803,28 € |
| Pacchetto martedì/giovedì AM: 600 €/mese, 12 mesi | 7.200 € | 5.901,64 € |
| Fasce martedì/giovedì AM: 75 €/utilizzo, 104 fasce | 7.800 € | 6.393,44 € |

## Finanza e indicatori

- Nuove spese = (purchase: prezzo + spese acquisto; owned: zero) + lavori + altre spese iniziali.
- Nuovo capitale proprio = nuove spese − nuovo prestito. Il valore già posseduto resta un denominatore patrimoniale, non un nuovo esborso. Il ritorno sul nuovo capitale **non** è il ritorno sul patrimonio netto storico dell’immobile.
- Nuove rate annue: `calculateMortgage` esistente, senza modificarlo. Rata mensile annua a tasso zero = capitale / anni; a tasso positivo, annuità standard con 12 rate. Rate totali = nuove rate + servizio del debito esistente.
- Costi operativi = fissi + ricavi attesi senza IVA × variablePct/100.
- Margine operativo = ricavi attesi senza IVA − costi operativi.
- Cashflow stimato = margine operativo − rate totali, **prima delle imposte sul reddito**. Non è riconciliazione di cassa o conto economico certificato; nessun timing dei pagamenti, ammortamento, rivendita, plusvalenza, inflazione o rivalutazione.
- Rendimento lordo sul bene = ricavi attesi senza IVA / valore(prezzo) × 100. Rendimento operativo = margine / valore(prezzo) × 100. Non sono rendimenti netti dopo tutte le imposte.
- Ritorno sul nuovo capitale = cashflow / nuovo capitale proprio × 100. Con denominatore zero: N/A. Margini e cashflow negativi rimangono negativi.
- Pareggio dopo rate: (fissi + rate) / (1 − variablePct/100); con costi variabili 100% nessuna soglia finita, N/A. Soglia percentuale = pareggio / ricavi contrattuali senza IVA × 100. È quota di ricavo, **non** occupazione turistica, può superare 100%. Non valorizza automaticamente spazi liberi o nuove tariffe.
- Concentrazione: maggiore somma dei corrispettivi contrattuali per stesso codice / totale. Base comprensiva dell’eventuale IVA, dichiarata nella UI; codice duplicato aggregato. Contratti diversi allo stesso codice non sono controparti indipendenti.
- Sensibilità: riduci ricavi attesi di x%, ricalcola variabili su tale ricavo, moltiplica costi fissi + variabili per (1+y%), sottrai rate invariate. Non assegna probabilità di rischio, non sostituisce i dati base.

Calcoli con double precision; arrotondamenti solo di visualizzazione. Con più contratti imponibili non effettua arrotondamenti per fattura né liquidazioni fiscali.

Per un confronto con B&B, allineare anno, capitale, costi e base fiscale. Il modulo commerciale espone cashflow prima delle imposte sul reddito, mentre il simulatore B&B considera le imposte configurate: i rendimenti non sono direttamente confrontabili senza uniformare le ipotesi. Il link tra i moduli permette due simulazioni separate, non un report comparativo fiscale omogeneo.

## Verifiche e sviluppi successivi

Fonte informativa primaria consultata il 23/10/2026: Agenzia delle Entrate, pagina “Opzione imponibilità Iva per i contratti di locazione in corso”: https://www.agenziaentrate.gov.it/portale/schede/istanze/opzione-iva-per-contratti-locazione-in-corso/scheda-informativa-opzione-iva-contratti-locazione . La pagina documenta l’esistenza di opzioni, non qualifica una concessione d’uso specifica. Nessun 22% automatico; il caso del potenziale cliente richiede conferma del contratto e del suo trattamento fiscale.

Checklist pubblica non certificativa: destinazione d’uso, accessibilità, impianti, possibile suddivisione; titolo contrattuale e servizi inclusi; trattamento IVA, registro e imposte; distinzione tra studi indipendenti, spazi condivisi e struttura sanitaria organizzata. Temi da sottoporre ai professionisti e agli uffici competenti in base al caso: non dichiariamo tutti gli adempimenti obbligatori.

Fase 2: validazione del modello con utenti reali, contratto cloud dedicato con permessi e isolamento, salvataggi, dashboard/portafoglio, report commerciali conformi ai piani, assistente contestuale. Successivamente, solo con fonti: benchmark commerciali documentati. Nessuno di questi servizi è promesso come già attivo.
