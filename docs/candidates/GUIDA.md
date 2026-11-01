# Confronto dei candidati — guida utente e fondatore

## Per l'utente

Da **Immobili → Confronta i tuoi candidati** apri `/immobili/candidati/`.

1. Inserisci una scheda o importa il modello CSV con anteprima. Conferma solo le righe valide che vuoi aggiungere. Il modello contiene tre esempi sintetici: sostituiscili con i tuoi dati.
2. Imposta almeno un vincolo: budget totale, comune/zona, superficie minima o capitale disponibile. La zona preferita è separata dai vincoli e non cambia il risultato.
3. Leggi sintesi, motivi e dati mancanti; usa «Spiega» per condividere quella stessa scheda con l'assistente. «Completa in Analizza» apre una nuova scheda: verifica cosa è stato copiato e completa il resto prima del calcolo.

L'elenco vive solo nella memoria della pagina: ricaricare/chiudere lo elimina. Non è un nuovo archivio account. Il simulatore si apre in una nuova scheda per lasciare l'elenco nella precedente. Cambio account o logout azzerano elenco, criteri, anteprima e selezione dell'assistente. Nessun candidato viene trasformato in proprietà PMS, acquisto o prenotazione.

### Cosa significano gli stati

- **Compatibile con i criteri: da approfondire**: i vincoli indicati sono rispettati sui valori dichiarati. Non è una raccomandazione d'acquisto né una verifica dell'annuncio.
- **Fuori dai criteri**: almeno un dato noto viola un vincolo; anche le eventuali informazioni mancanti restano visibili.
- **Informazioni insufficienti**: manca un dato necessario o non è stato impostato nessun vincolo.

Per non favorire schede incomplete, servono sempre comune, prezzo, superficie, lavori e altre spese iniziali. Se una spesa è consapevolmente esclusa, inserisci 0; un campo vuoto resta mancante. Se usi la zona o il capitale come vincolo, servono anche i rispettivi dati. Gli ordinamenti numerici mettono le schede incomplete dopo quelle complete, quindi ordinano per il valore scelto; nessun punteggio aggregato. L'ordine iniziale è quello di inserimento.

**Budget totale** = prezzo richiesto + lavori/allestimento dichiarati + altre spese iniziali dichiarate, prima del finanziamento. Non certifica che tutte le spese siano state censite.

**Capitale disponibile** confronta il tuo limite con il capitale proprio previsto nella scheda, non con un mutuo concesso. Non ricostruisce autonomamente un fabbisogno di liquidità, né presume finanziabili lavori e spese: verifica il piano completo separatamente.

**Comune/zona** sono etichette inserite, confrontate esattamente dopo normalizzazione di maiuscole/accenti/spazi esterni. Non identificano una zona OMI e non sono geocodificate.

### CSV e unità

File fino a 512.000 byte (500 KiB circa), 50 righe dati. Modello IT con `;`; parser compatibile anche con `,`, tab, virgolette e BOM. Scegli esplicitamente IT (`150.000,50`) o EN (`150,000.50`) prima dell'anteprima. Non cambiare formato per reinterpretare automaticamente schede già aggiunte: i valori normalizzati restano invariati.

Le intestazioni tecniche sono identiche in IT/EN. Puoi omettere colonne facoltative; `reference` è necessaria. Colonne inattese, contatti, intestazioni duplicate, righe troppo grandi/malformate, HTML, riferimenti pericolosi o numeri non validi vengono rifiutati o segnati non importabili. Non vengono interpretate istruzioni contenute nelle celle.

| Campo | Contenuto |
| --- | --- |
| `reference` | Codice interno 1–64 caratteri: lettere, numeri, `_`, `-`; confronto duplicati senza distinzione maiuscole. Non nomi o contatti. Generato se omesso nell'inserimento manuale. |
| `city`, `zone` | Comune e zona dichiarati, massimo 80 caratteri; non indirizzi personali o contatti. |
| `price_eur`, `area_sqm` | Prezzo richiesto EUR e superficie dichiarata m², positivi se indicati. |
| `works_eur`, `other_upfront_eur` | Lavori/allestimento e altre spese iniziali EUR; zero ammesso. |
| `equity_eur` | Capitale proprio previsto per l'acquisto EUR; non disponibilità bancaria verificata. |
| `nightly_eur`, `occupancy_pct` | Ipotesi dell'utente EUR/notte e percentuale 0–100. Non rilevate da OMI/turismo. |
| `monthly_costs_eur` | Costi operativi EUR/mese, distinti dalle spese iniziali. |
| `commission_pct`, `model_tax_pct`, `interest_pct` | Percentuali 0–100; input dichiarati, non interpretazioni fiscali né offerte bancarie. |
| `loan_years` | Durata dichiarata, intero 1–100. |
| `listing_url` | Facoltativo, HTTPS senza credenziali, massimo 2.048 caratteri; solo collegamento esterno. Nessun download o scraping. |
| `checked_on` | Data YYYY-MM-DD dichiarata dall'utente; non un controllo online del sistema. |

Limiti tecnici: prezzo, capitale e costi fino a 100 milioni EUR; superficie fino a 10.000 m²; tariffa fino a 1 milione EUR/notte. Questi limiti di validazione non sono soglie di convenienza. Per gli input testuali sono supportati fino a due decimali, con formato esplicito. Duplicati per riferimento o URL esatto sono evidenziati; nessuna deduzione di identità da indirizzi simili.

### Ipotesi economiche e Analizza

Le ipotesi comuni sono facoltative: seleziona prima i riferimenti, poi applica i soli campi compilati. La selezione e gli esiti sono visibili; i campi vuoti non cancellano valori esistenti. Non vengono aggiunti tassi, occupazioni o aliquote di default. Le origini manuale/CSV/ipotesi comune rimangono nel contesto della pagina.

Nell'elenco non vengono calcolati ROI, cashflow o investment score. Il calcolo avviene solo nel simulatore esistente e con le autorizzazioni del piano. Il trasferimento usa il frammento del link, non inviato al server, e lo rimuove dall’indirizzo dopo la lettura. Nessun archivio candidato viene scritto nel browser. Copia comune, prezzo e ipotesi economiche effettivamente presenti. Superficie è solo contesto; lavori, altre spese e URL non vengono riclassificati in input finanziari. Il prezzo non viene aumentato silenziosamente delle spese iniziali.

Un riepilogo in Analizza elenca campi copiati e mancanti. Il percorso candidati blocca il calcolo finché gli input economici sono espliciti, evitando i default legacy. L'occupazione mancante viene segnata «Da indicare»: un cursore non può rappresentare un campo vuoto. Un'occupazione frazionaria fornita viene preservata. Un trasferimento mutuo già presente mantiene priorità e non viene sovrascritto. Nessun calcolo o salvataggio è avviato dall'apertura del link.

## Per il fondatore

Funzione pubblica di selezione preliminare, riusa parser/validatori e il percorso Analizza. Nessuna scrittura Firestore/account, API nuova, dipendenza nuova, feed annunci o autorizzazione aggiuntiva. Vendite sospese, Investor 30 giorni e PDF restano invariati. Home non riscritta; solo ingresso in Immobili.

Moduli: `candidate-screening.js` (validazione e criteri), `candidate-copy.js` (spiegazioni comuni), `candidate-workspace.js` (UI e contesto corrente), `candidate-transfer.js` (estensione dell'handoff esistente), `chatbot/core/candidate-response-engine.js` (lettura del medesimo contesto). Nel calcolatore è aggiunto solo un controllo iniziale per i link candidati, senza modificare motori/formule/tassazione o il comportamento ordinario.

Il registro fonti include l'impronta della pagina `immobili/index.html`. Il solo link di navigazione aggiunto modifica legittimamente quei byte: è aggiornata esclusivamente quell'impronta nella famiglia editoriale e rigenerato il modulo browser. Le schede delle fonti, periodi, acquisizioni, dataset e impronte dei motori non cambiano. La nuova versione del registro identifica la modifica documentata, non un controllo remoto o una certificazione delle fonti.

Test e limiti sono in [COLLAUDO.md](COLLAUDO.md); evoluzioni sensibili in [PROPOSTE.md](PROPOSTE.md). Fiscalità, fabbisogno effettivo, finanziamento, validità dei preventivi e condizioni degli immobili richiedono revisione professionale.
