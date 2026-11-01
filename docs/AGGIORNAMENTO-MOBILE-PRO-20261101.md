# Aggiornamento mobile e presentazione Pro — 1 novembre 2026

Base: main a5903050d3c8798fc58f6ce07cf1d104adfe06be.

## Contenuto
- Header mobile: misurato l'elemento visibile anziché il suo contenitore, che può avere altezza zero. Gestiti inserimento asincrono, ridimensionamento e rotazione. Altezza zero non azzera l'ultima misura utile.
- Spazio superiore mobile calcolato sull'altezza dell'header, con minimo prudenziale e margine. Desktop invariato. Le ancore Dati/Risultati/Approfondimenti del simulatore riservano lo spazio superiore.
- Snapshot Pro: l'etichetta ROI sul capitale proprio usa analysis.roi e la relativa applicabilità. Non usa realROI (cashflow/prezzo) o la memoria di altre domande come sostituto. Zero e negativi conservati, capitale zero N/A, mancanti --. Nessuna modifica ai calcoli.
- Candidati: aggiunto il motore linguistico condiviso mancante. Corretto il titolo italiano. Il passaggio IT/EN usa lo stesso motore del portale.
- Token dei file mobile aggiornati in Analizza e Candidati; token della UI chat aggiornato nel loader.

## Prove
15 test mirati passati sul pacchetto finale: denominatore ROI, zeri, negativi, assenze, caricamento lingua, misurazione header reale, header asincrono, altezza zero, resize con/senza ResizeObserver e regole CSS mobili. Sintassi JS verificata.

La suite completa 2385 test era passata prima dell'aggiunta della correzione mobile. Non è stata rieseguita su questo pacchetto finale: non attribuirle una verifica che non ha effettuato. I test correnti usano VM/DOM simulati; Safari dopo distribuzione resta da collaudare. Nessuna nuova CI remota avviata.

## Esiti del precedente collaudo Pro
Accesso riuscito sul dominio di produzione, piano Pro annuale verificato. Archivio e report selezionato coerenti; PDF e CSV PMS scaricati e valori riconciliati; assistente su arrivi/struttura sconosciuta/periodo non supportato e OMI IT/EN verificato. Autopilot coerente con la checklist. Candidati manuali e CSV sintetico con anteprima, conferma e ordinamento funzionanti.

## Aperto, non incluso
- La nuova scheda Analizza non conserva l'accesso Pro in una sessione senza mantenimento permanente; la scheda originaria resta Pro. Occorre un intervento separato sul flusso che preservi anche l'elenco candidati. Non vengono copiati token o cambiate impostazioni auth.
- Dashboard da rendere più compatta: priorità quotidiane prima delle spiegazioni, una sola barra azioni, header uniforme.
- Metadato OMI di copertura ancora italiano nella risposta EN.
- Collegamento diretto del report corrente alla chat: oggi richiede l'allegato PDF, esplicitamente dichiarato.
- Costi/incassi B&B e OTA non vengono aggiunti. Non sono un rendiconto completo o una sincronizzazione multicanale.

Nessuna modifica a Firebase, autenticazione, formule finanziarie, record, Stripe, vendite sospese, Investor 30 giorni o restrizioni PDF. Nessun deploy eseguito durante la preparazione.

## Caricamento
Estrarre lo ZIP e caricare le cartelle css, js, tool, immobili, tests, docs nella radice di main, mantenendo i percorsi e con un solo commit. Non caricare lo ZIP come file del sito. Se main è avanzato rispetto alla base indicata, confrontare prima le nuove modifiche.

Attendere CI Regressioni prodotto e Vercel. Poi ricaricare Safari e verificare:
1. Analizza aperto in cima: scritta sopra il titolo e titolo completamente visibili.
2. Toccare Dati/Risultati/Approfondimenti: nessun titolo coperto dall'header.
3. Ruotare il telefono, aprire/chiudere menu e ripetere; verificare anche Dashboard, Home e Candidati, senza spazi eccessivi.
4. Candidati IT → EN → IT, elenco conservato durante il cambio lingua.
5. Snapshot ROI Pro e report con la stessa analisi: stesso denominatore; dati mancanti non diventano zero.

Per Codex: controllare il diff contro lo SHA base, eseguire node --test tests/mobile-pro-followup.test.mjs, npm test e node scripts/audit-source-registry.mjs. Verificare separatamente la geometria Safari/browser; il test VM non la certifica.

Ripristino preferito: revert del singolo commit caricato, senza modificare record. Lo ZIP di ripristino contiene gli originali dei sei file applicativi sostituiti; rimuovere i due nuovi file test/documentazione solo se si procede manualmente.
