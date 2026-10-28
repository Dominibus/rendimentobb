# Contesto turistico ISTAT · RC217

## Scopo e perimetro

Il pannello pubblico in Mercato e Analizza integra i flussi turistici comunali dei 20 capoluoghi di regione, con anno osservato 2025 e acquisizione del file il 28 ottobre 2026. I prezzi degli annunci rimangono una serie distinta, disponibile per 9 capoluoghi. Nessun valore turistico viene trasferito alle formule, a PDF, dashboard, PMS o Autopilot; nessuna modifica alle analisi salvate.

Arrivi = registrazioni nelle strutture, non persone uniche. Presenze = pernottamenti di persone, non camere-notti. Sono aggregati di tutte le strutture della rilevazione, non del solo B&B o della singola piattaforma. Non permettono di ricavare occupazione, ADR, ricavi o ROI del singolo immobile.

Il flag originale `(f)` segnala che dal 2025 si includono gli alloggi privati in affitto non gestiti in forma imprenditoriale: totali ed extralberghiero non sono confrontabili con gli anni precedenti. La patch non calcola crescita 2025/2024. Il mese descrive flussi registrati; non prevede la domanda futura. Nessuna affermazione di dato definitivo o in tempo reale.

## Provenienza

- ISTAT, flusso `IT1/DF_BULK_DCSC_OCCUPCOLLE/1.0`.
- Archivio: https://esploradati.istat.it/databrowser/DWL/Servizi/DCSC_Occupancy_in_collective_accommodation.zip
- SHA256 archivio acquisito: `34de435ceeba173ccc40b9fdf56c2cfcf07425feb522b10407b72df3b93466e4`.
- File originale `2_dati_comunali.xlsx`, SHA256 `f900914afe009aeb05ee34ea12d31a7233cf55bff5cef3424cda4df6df48c592`.
- Fogli `Comunali annuali | Annual data`, `Comunali Mensili | Monthly data`; numeri di riga conservati per ogni comune.
- Licenza CC BY 4.0, attribuzione ISTAT: https://www.istat.it/dati/open-data/
- Cagliari: codice della fonte 092009, identità amministrativa corrente 118006. Raccordo ufficiale efficace dal 1 gennaio 2026, conservato separatamente; fonte nella proprietà `crosswalk.sourceURL` del JSON.
- La diversa serie regionale FVG non è mescolata a questa serie: restano distinti i 163 pernottamenti di differenza già riscontrati su Trieste 2025.

## Rigenerazione offline e aggiornamenti

Non scaricare il provider dai browser dei visitatori. Il file nazionale viene acquisito una sola volta per controllo. Nessuna nuova dipendenza di produzione o API a pagamento.

Per riprodurre il dataset dal workbook originale, dalla radice del repository:

```sh
python3 scripts/build-tourism-context.py /percorso/2_dati_comunali.xlsx --acquired-at 2026-10-28 --output /tmp/istat-candidate.json
node --test tests/rc217-tourism.test.js
python3 -m unittest discover -s tests -p 'rc217_tourism.py'
```

Il builder usa solo libreria standard Python, non modifica l'originale e rifiuta un output già esistente. Verifica identità esatte, flag, riconciliazioni residenti/non residenti e alberghiero/extralberghiero, 12 mesi e totali annuali. Valori soppressi o mancanti fanno fallire la generazione, non diventano zero. L'attuale schema ammette esclusivamente il 2025 con flag f: un nuovo anno richiede revisione esplicita del modello e della comunicazione, non semplice cambio del file.

Il workflow mensile esistente aggiunge un solo controllo dell'impronta SHA256 dell'archivio ISTAT. L'artifact `tourism-source.json` distingue:

- `unchanged_archive`: stessi byte dell'archivio acquisito; NON certifica attualità dei valori o assenza di revisioni in altre fonti;
- `archive_changed_requires_review`: archivio diverso, da acquisire e rivedere; NON pubblica dati;
- `check_failed`: impossibile verificarlo, da riprovare; il job fallisce e non afferma che i dati siano aggiornati.

Un cambiamento dell'archivio può riguardare anche altri fogli o periodi: confrontare contenuti e metadati prima di sostituire la serie. Dopo revisione, aggiornare JSON, baseline dell'archivio, test e versioni delle risorse nella stessa patch. Non aggiornare la sola data di acquisizione per far sembrare recente un periodo vecchio. Monitoraggio mensile non equivale a pubblicazione mensile dei dati statistici.

## Esperienza e limiti della verifica

Sintesi con due valori annuali, avviso di discontinuità visibile e approfondimento mensile chiuso inizialmente. Componenti in colonna sotto 600 px, tabella a larghezza contenuta, identità persistente al cambio lingua. Dati mancanti, errori e retry non sostituiscono numeri e non nascondono il distinto confronto prezzi.

Verifica automatica DOM in IT/EN, non collaudo Safari/iPhone reale. Dopo applicazione in ambiente di prova verificare 320/375/390/430 px, orizzontale, zoom testo, tastiera del selettore e lettore di schermo. Non è stato eseguito un nuovo controllo contabile o fiscale: formule e motore finanziario sono invariati.

## Roadmap successiva

1. OMI nazionale: alta priorità, difficoltà media. Attendere l'archivio richiesto; validare Zone/Valori/KML, semestre, unità, tipologie e licenza. Beneficio: quotazioni immobiliari documentate per più comuni; restano intervalli orientativi, non stime puntuali.
2. Flussi ISTAT oltre i capoluoghi: priorità media, difficoltà media. Gestire riservatezza e valori mancanti, versioni amministrative e copertura effettiva prima di estendere la ricerca.
3. Storico e scenari professionali: priorità media, difficoltà alta. Definire serie omogenee dopo la discontinuità e verificare le metriche prima di introdurre confronti. Nessuna previsione o tasso di occupazione dedotto dai soli flussi.
