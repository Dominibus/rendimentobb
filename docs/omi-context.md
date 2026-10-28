# OMI 2026/1 · RC218

## Cosa aggiunge

Mercato e il confronto territoriale in Analizza permettono di consultare le quotazioni OMI dei 20 capoluoghi di regione. La scelta è esplicita: zona OMI, tipologia e stato conservativo/posizione commerciale. Nessun intervallo viene scelto automaticamente, mediato o trasferito alle ipotesi finanziarie. Sono mantenuti distinti:

- quotazioni di compravendita OMI in €/m²;
- locazioni OMI in €/m² al mese, con base di superficie propria;
- flussi turistici ISTAT 2025;
- prezzi base turistici pubblicati per notte, disponibili per 9 capoluoghi.

Non vengono modificati motore finanziario, fiscalità, simulazioni salvate, dashboard, PDF, PMS o Autopilot. Nessuna nuova dipendenza, API a pagamento o modifica in produzione.

## Fonte e verifiche del file ricevuto

Archivio originale OMI.zip, 112.260.213 byte, SHA256 `0748a17f6a083c15f8c2ab71d80cd45d8936c71dd05e970f9971a937461a868c`.

- `QI_20261_VALORI.csv`: 157.672 righe di dati.
- `QI_20261_ZONE.csv`: 26.988 righe di dati.
- 7.887 codici comunali distinti nei CSV e 7.885 file KML. Il numero dei file non è una garanzia di copertura di tutti i comuni attuali.
- Semestre dichiarato da entrambi i CSV: 2026/1. Elaborazione dichiarata: 15 ottobre 2026. Acquisizione: 28 ottobre 2026. Non confondere queste date con il periodo gennaio–giugno 2026.
- Integrità CRC dell'intero ZIP verificata. SHA256 distinti dei due CSV conservati nei JSON.
- Estratte 6.006 righe per 20 capoluoghi, senza medie o aggregazioni delle quotazioni. Associazione esatta con ZONE, senza duplicati di zona/tipologia/stato. Conservati numeri di riga originali (riga 1 metadati, riga 2 intestazioni).
- Verificati XML, comune, semestre e presenza dei codici delle zone nei KML dei 20 capoluoghi. Le geometrie non sono pubblicate in questa patch e non attribuiscono automaticamente la zona a un indirizzo. Non è un collaudo topologico/catastale nazionale.

Riferimenti ufficiali:

- Forniture: https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/forniture-dati-omi-cittadini
- Guida e tracciato: https://telematici.agenziaentrate.gov.it/pdf/guidaFornitureOMI.pdf
- Legenda unità: https://www1.agenziaentrate.gov.it/servizi/geopoi_omi/legenda.htm
- Cartografia: https://www1.agenziaentrate.gov.it/servizi/geopoi_omi/index.php

Attribuzione: Agenzia Entrate - OMI. Licenza CC BY 4.0 riportata nella pagina ufficiale mostrata dall'utente nella sessione. L'archivio non contiene un separato file di licenza. Il recupero web della pagina Forniture ha restituito 403; guida e legenda ufficiali sono state consultate. Non si dichiara una nuova verifica automatizzata della licenza nel sito riservato.

## Codici e copertura

I codici nel campo `Comune_ISTAT` OMI non sono direttamente i sei caratteri delle identità amministrative attuali. Alcuni formati e comuni sono storici: è scorretto applicare a tutto l'archivio il semplice taglio delle ultime sei cifre.

La prima integrazione usa una lista esplicita di 20 raccordi verificati, con codice originale, nome della fonte, sigla provincia, codice catastale e identità corrente. Esempi:

- Roma: codice OMI 12058091, catastale H501, identità corrente 058091.
- Cagliari: codice OMI 20092009, catastale B354, identità corrente 118006; resta riconoscibile il codice storico 092009 già raccordato nella RC217 con fonte ISTAT ufficiale.
- L'Aquila: descrizione originale L`AQUILA, codice catastale A345; l'apostrofo non viene usato per indovinare un'identità nazionale.

Gli altri comuni non ricevono valori di capoluoghi vicini. La disponibilità dell'archivio nazionale non equivale alla sua integrazione completa nella UI. Per estendere il servizio occorre un raccordo nazionale catastale/ISTAT verificato, gestendo fusioni, sezioni, codici mancanti o abbreviati e province storiche. Nessun dato del file originale è perso: il builder potrà essere esteso dopo questa verifica.

## Metodo e limiti

Le quotazioni OMI rappresentano intervalli indicativi di zona per immobili ordinari e non sostituiscono una stima puntuale di un tecnico professionista. Non si calcolano media dei due estremi, valore dell'immobile, rendimento lordo o cashflow a partire dagli intervalli.

Compravendita e locazione possono riferirsi a basi diverse: L = superficie lorda, N = superficie netta. L'interfaccia mostra la base separatamente accanto a ogni intervallo. Nessuna conversione fra superfici. L'affitto OMI non è una tariffa turistica per notte.

Le coppie originali assenti o 0/0 sono rappresentate come `null/null` e mostrate come non disponibili; mai come prezzo nullo o costo zero. Un solo estremo mancante, numeri non finiti, negativi, intervalli invertiti o una superficie sconosciuta fanno fallire la preparazione. La riga originale resta rintracciabile nel file ricevuto.

Per negozi e centri commerciali il giudizio riguarda la posizione commerciale. Per box, posti auto e autorimesse non è significativa la distinzione delle quotazioni per stato conservativo. La UI conserva tali avvertenze e l'indicazione dello stato prevalente presente nella fonte.

La zona deve essere verificata sulla cartografia ufficiale. Nessuna equivalenza automatica tra zone OMI e quartieri della fonte dei prezzi turistici. Regolarità urbanistica/catastale, qualità, lavori e caratteristiche del singolo immobile richiedono approfondimenti professionali.

## Rigenerazione e aggiornamento

Dalla radice del repository, con Python standard e il file originale:

```sh
python3 scripts/build-omi-context.py /percorso/OMI.zip --acquired-at 2026-10-28 --output-dir /tmp/omi-candidate-nuovo
node scripts/audit-omi.mjs /tmp/omi-integrity.json
node --test tests/rc218-omi.test.js
python3 -m unittest discover -s tests -p 'rc218_omi.py'
```

Il builder rifiuta una cartella di output già esistente e semestri/date di elaborazione non ancora revisionati. Non modifica l'originale né pubblica dati. `review-report.json` è solo per audit e non va caricato in `data/omi`.

Il controllo mensile aggiunge l'artifact `omi-integrity.json`: verifica i dati già nel repository e calcola i giorni dall'acquisizione. La revisione è segnalata dopo 180 giorni (regola interna), ma NON è controllato l'ultimo semestre del provider. Un report integro non significa che non siano uscite rettifiche o nuovi semestri. Per questi serve un nuovo export ufficiale, revisione di struttura, unità, identità e licenza, rigenerazione, test e aggiornamento delle versioni risorse. Nessun accesso automatizzato all'area riservata e nessuna pubblicazione automatica.

## Verifica UI e attività successive

Test DOM IT/EN su selezione esatta, superfici diverse, dati mancanti, cambio comune, risposte asincrone obsolete, errori e riprova. Dati e collegamenti sono caricati localmente; nessuna chiamata al provider dal browser durante la consultazione. I collegamenti esterni si aprono solo su azione dell'utente.

Non eseguito un collaudo reale Safari/iPhone: verificare dopo applicazione in ambiente di prova 320/375/390/430 px, orientamento orizzontale, selettori nativi, zoom testo e lettore di schermo. Layout nuovo in colonna sotto 600 px e dettagli chiusi inizialmente per evitare una pagina troppo densa.

Priorità successive:

1. Alta, difficoltà media/alta: raccordo nazionale verificato per estendere oltre i capoluoghi. Beneficio: consultazione locale senza sostituzioni arbitrarie.
2. Media, difficoltà alta: geometrie interattive e ricerca per indirizzo, dopo test topologici e gestione di confini/ambiguità. Beneficio: scelta della zona più semplice; nessuna geocodifica automatica nella patch attuale.
3. Media, difficoltà media: confronto fra semestri omogenei, considerando revisioni e variazioni dei perimetri. Beneficio: storico leggibile senza crescita inventata.
4. Successiva: scheda professionale condivisibile che mantenga distinti ipotesi, fonti e giudizio specialistico. Nessun servizio di acquisizione clienti.
