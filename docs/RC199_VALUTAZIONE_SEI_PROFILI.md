# RC199 — Verifica prodotto e ricerca territoriale

26 ottobre 2026. Base: ZIP rendimentobb-main(20261026-081306).zip, commit dichiarato dall'archivio a61e52e95cf116353681ef5c0b60ce13043afd3b.

## Giudizio

Prodotto convincente per una prova assistita con tester italiani. Il valore più ricorrente è nel controllo operativo B&B e nella gestione di locali e studi. La simulazione occasionale da sola non dimostra una disponibilità a pagare un abbonamento. Non è possibile certificare che ogni schermata o operazione sia perfetta.

| Profilo simulato | Cosa funziona | Cosa manca per convincere nel tempo |
|---|---|---|
| Proprietario di casa | Accesso per immobile già posseduto; risultati e ipotesi distinti | Accompagnamento iniziale breve e dati concreti dell'immobile |
| Investitore | Percorso immobili → mutuo → analisi; confronto tra scenari | Riferimenti territoriali pertinenti e documentazione dei costi |
| Gestore B&B | Dashboard demo con KPI leggibili e accesso alla gestione | Collaudo dei suoi dati e uso continuativo del calendario |
| Consulente | Metodo, formule, fonti e limiti esposti | Copertura territoriale più ampia e verifica dei report del proprio caso |
| Proprietario di locale / attività | Canoni dell'immobile e movimenti separati | Prova su contratti e costi reali; PDF commerciale ancora assente |
| Gestore di studio medico/condiviso | Stanze, fasce, calendario e Autopilot dedicati | Verifica dei flussi quotidiani; perimetro limitato agli spazi, senza dati sanitari |

Questi sono percorsi valutati internamente: non interviste né sei tester reali.

## Osservato nel browser pubblico desktop

- Home: riconoscibili B&B e locali/studi; grafica leggibile nella vista controllata. La hero è lunga e i pulsanti principali sono vicini al fondo della prima schermata.
- Immobili: confronto di due immobili e fonti esterne comprensibili; i quattro esempi restano esplicitamente dimostrativi.
- Dashboard Free: termina il caricamento mostrando i dati fittizi; ricavi prenotati distinti dagli incassi. Nessun allargamento orizzontale rilevato nella finestra controllata.
- Simulatore Free: eseguito un calcolo con prezzo 150.000, capitale 30.000 e costi mensili 800; compare conferma del risultato solo in sessione. Non è stata inviata alcuna richiesta commerciale.
- Chatbot: dopo il calcolo B&B, domanda su stanze, canone mensile e «calndario» riconosciuta come commerciale; link corretti a simulatore e PMS. Risposta pertinente ma troppo lunga per una semplice domanda di navigazione.
- PMS commerciale demo: riepilogo con canoni 1.910, incassi 1.200 e costi 120; saldo registrato 1.080. Calendario stanza R1 e sezione Autopilot si aprono. Differenze da riconciliare, senza attribuire automaticamente morosità.
- Pagine ROI e Aprire un B&B: metodo e percorsi di approfondimento leggibili; esempio ROI didattico con ricavi, costi e rendimento coerenti nell'aritmetica mostrata.
- Mutui: campi, confronto preventivi e limiti visibili; nessuna immagine mancante e nessun allargamento orizzontale nel controllo svolto. Non sono state ricertificate le condizioni bancarie o le fonti esterne citate dal sito.

## Correzioni della patch

1. Scelta rapida dei 20 capoluoghi regionali dello snapshot incluso, accanto alla ricerca di tutti i comuni, in Market e nel simulatore.
2. Ricerca dei comuni anche nei due immobili del confronto; nome e provincia trasferiti nei campi esistenti.
3. Dashboard: selettore ampliato ai capoluoghi e collegamento a Market per la città scelta. La selezione non filtra gli immobili del portafoglio.
4. Niente ripiego sul valore nazionale per i territori privi di riferimento, né immagini casuali attribuite alla città scelta. Ripristinato il ricalcolo del confronto alla variazione della città.
5. In assenza di riferimento locale, il simulatore lo dichiara anche a Free: l'abbonamento non crea dati territoriali mancanti. Eliminato il successivo messaggio generico che sovrascriveva l'avviso dopo il calcolo.
6. Market: titolo e spiegazione prima della ricerca; selezione iniziale coerente o richiesta esplicita di scegliere il territorio.
7. Aggiornamento della cache degli asset modificati; selezione rapida protetta da risultati asincroni della ricerca precedente.

Le quattro città con esempi e guide dedicate rimangono tali. Le altre città aprono uno scenario o la verifica territoriale: non sono stati creati annunci, prezzi, ROI locali o pagine SEO fittizi. Il numero di comuni e i codici amministrativi sono quelli dello snapshot ISTAT già incluso, non un aggiornamento anagrafico in tempo reale.

## Verifiche

- 1.876 test Node superati, zero errori; inclusi motori finanziari, PMS, assistente, comuni e capoluoghi.
- 9 test Python territoriali superati.
- Controllo strutturale: 51 pagine, nessuna risorsa locale mancante, ID duplicato o errore di sintassi rilevato. È un controllo del codice, non di ogni pixel.
- I test storici che isolano funzioni sono stati aggiornati per importare i nuovi helper reali e per i nuovi avvisi/versioni cache; mantenute le verifiche su accessi e valori nulli/zero.

## Limiti e prossime verifiche

Questa sessione non ha autenticato account Pro, Investor o admin, non ha generato PDF privati e non ha scritto su Firebase reale. Le regressioni automatiche non sostituiscono queste prove. Nessuna prova su iPhone reale o anteprima browser della patch locale. Le osservazioni dal vivo riguardano il sito pubblicato prima di questa patch.

Le pagine SEO hanno una base tecnica verificabile; posizionamento, indicizzazione e conversioni richiedono dati Search Console/analytics e utenti reali. La patch non promette traffico. Priorità successive: collaudo pubblicato su telefono, prova completa con account e feedback d'uso; poi accorciare le risposte di navigazione e alleggerire la home con riscontri reali.
