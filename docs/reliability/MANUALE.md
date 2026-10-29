# Manuale operativo e formativo del fondatore

## Tre distinzioni da imparare

Una **fonte** è chi pubblica; un **dataset** è un insieme preciso di dati con periodo e territorio; un **modello** è il codice che applica formule e ipotesi. Una pagina professionale e una suite verde non rendono veritiero un dato senza origine.

Un hash SHA256 è un'impronta dei byte. Se cambia segnala che il file è diverso; non dimostra che sia giusto o aggiornato. Una licenza consente determinati usi, ma occorre controllare prodotto, condizioni di distribuzione e uso concreto. Una fonte ufficiale può essere troppo aggregata per il singolo immobile.

In campo economico **ricavo prenotato**, **incasso**, **margine operativo**, **cashflow dopo debito** e **utile fiscale** sono grandezze diverse. Il software non determina autonomamente regime fiscale o conformità.

## Per modulo

| Modulo | Dati, origine e formule | Come controllare / limite / guasto |
|---|---|---|
| Analizza B&B | Prezzo, capitale, prezzo notte, occupazione, costi, commissioni, tasso/durata inseriti; default interni | Ricavi annui = prezzo notte × 365 × occupazione/100. Commissioni = ricavi × percentuale. Costi = mensili×12 oppure percentuali solo se dichiarati. Margine = ricavi−commissioni−costi. Imposta modellata = max(margine,0)×aliquota. Cashflow = margine−imposta−rate annue. ROI equity = cashflow/capitale×100, N/A senza capitale. È simulazione, non bilancio fiscale. Input non validi vanno corretti, non riempiti con medie territoriali. |
| Rata mutuo | Capitale P, TAN annuo, durata; tasso mensile i=TAN/1200, n=anni×12 | Rata P×i/[1−(1+i)^−n]; con i=0, P/n. Moltiplicare per12 per servizio annuo. Tasso costante e costi accessori separati; TAEG dichiarato dal preventivo non stimato. Offerte interne non bancarie reali. |
| Score/rischio | Soglie e pesi nel motore ROI, con input della simulazione | Non è probabilità di successo. Riprodurre casi attorno alle soglie con test e codice della stessa versione; non modificare insieme a un aggiornamento dati. |
| Mercato / comuni | Anagrafica ISTAT, turismo aggregato, OMI, prezzi pubblicizzati privati e ipotesi interne distinti | Leggere periodo, territorio, tipologia e unità prima del confronto. OMI €/m² non prezzo notte; presenze persone non camere occupate. Fuori copertura: non disponibile. Le ipotesi non diventano fonti ufficiali. |
| Immobili | Esempi statici e link ai portali | Verificare l'annuncio reale sul portale: i link generali non provano prezzo/disponibilità degli esempi. Nessuna sincronizzazione automatica attiva. |
| Locali/studi | Stanze/fasce/contratti e realizzo atteso inseriti; IVA dichiarata | Contrattuale lordo = importo × unità; atteso = contrattuale × percentuale realizzo. IVA nota: netto = lordo/(1+aliquota); sconosciuta: non stimare. Costi e servizio debito danno cashflow economico, non utile fiscale. Controllare collisioni, chiusure e durata. Nessuna informazione clinica. |
| Dashboard | Scenari salvati e ipotesi storiche dell'account | Riaprire lo stesso ID e confrontare input/risultati; non sostituire valori assenti con0. La versione completa delle fonti storiche può non essere disponibile. Nessuna migrazione RC228. |
| PMS / calendario | Prenotazioni e importi registrati/importati, stato dichiarato | Notti = checkout−checkin; checkout escluso. Ricavi di periodo ripartiti sulle notti del soggiorno. ADR = ricavi/notti pertinenti, occupazione = notti/capacità nel modello; camere/chiusure non modellate in alcuni report: leggere limiti. Pulizia completata non cambia il ricavo; stato pagamento non prova riconciliazione bancaria. |
| Demo PMS / tariffa | Prenotazioni fittizie; fattori tariffari interni | Tassa demo €2 per ospite/notte massimo 5: non regola del Comune. Prezzo suggerito non benchmark osservato. Ricarica/ripristina azzera la demo senza modificare account. |
| PDF / CSV | Record e periodo scelti; estrazione dal documento corrente | Verificare ID, unità, periodo, ROI N/A e N/D. Il CSV mantiene valori numerici negativi, protegge testo interpretato come formula. I documenti estratti non sono autenticati; provenienza completa per nuove analisi è fase successiva. |
| Chatbot / Autopilot | Conoscenza editoriale + contesto corrente o PDF selezionato | Chiedere quale dato usa, confrontare con il record corrente, provare IT/EN e cambio contesto/logout. Non inventa fonte per colmare un campo mancante. Nessun aggiornamento normativo live, nessuna certificazione di adempimenti. Le proposte richiedono il flusso di conferma esistente. |
| Academy / SEO | Testi editoriali e link censiti | Verificare ogni affermazione rilevante contro atto/dataset specifico, data, territorio. Una pagina indicizzata non è aggiornata per definizione; canonical/hreflang non attestano correttezza economica. |
| Operations | Stati tecnici esistenti e nuovo inventario statico | “Censito” non significa validato. “Da revisionare” è un compito aperto. L'assenza di una segnalazione non certifica la piattaforma. Nessuna email delle fonti attivata da RC228. |

## Controllo ricorrente

1. Apri il Centro operativo con account amministrativo. Controlla scadenze, categorie e riferimenti. Per ora gli esiti GitHub vanno letti su Actions: non arrivano automaticamente in questa vista.
2. Da checkout pulito del branch esegui `npm ci`, `npm test`, `node scripts/audit-source-registry.mjs`, `node tests/rc213-financial-identities.mjs`, `python3 -m unittest discover -s tests -p '*.py'`.
3. Leggi il workflow **Controllo mensile fonti territoriali**: un candidato non è pubblicato. Inside Airbnb deve indicare blocked_provider_policy_review; gli altri file hanno scope propri. Artifact conservati14 giorni, non archivio storico permanente.
4. Per un aggiornamento apri un branch dati specifico, conserva versione originale e licenza, usa i builder già documentati offline. Controlla copertura/periodi/flag/unità e differenze. Aggiorna le schede solo dopo verifica, mai copiando un hash “per far passare il test”.
5. Rigenera soltanto il modulo browser con `node scripts/audit-source-registry.mjs --write-browser`. Rivedi il diff del JSON e del modulo derivato; ripeti i test pertinenti.
6. PR con evidenze, revisore, rollback e impatto. Il fondatore approva cambiamenti sensibili e la promozione prevista. Non fare merge solo perché la CI è verde.

## Quando qualcosa non funziona

- **Hash diverso/file mancante:** ferma il candidato; non aggiornare l'impronta senza indagare. Recupera l'originale noto e identifica l'origine della differenza.
- **Fonte irraggiungibile:** conserva la versione precedente e segnala consultazione fallita. Non cancellare i valori né rinominare la data di acquisizione.
- **Nuovo anno/semestre o geografia:** rivedi schema, raccordi e comparabilità prima di trasformare il file.
- **Revisione scaduta:** pianifica un controllo, senza dedurre che il dato sia falso o che ne esista uno più recente.
- **Dubbio normativo/fiscale:** registra atto, articolo, versione alla data, territorio e decorrenza; chiedi validazione del modello al professionista. Non usare il default 21% come risposta alla domanda fiscale.
- **Rollback:** ripristina i file della PR o il commit applicativo precedente tramite normale PR e test; nessun reset dei record utenti. Il primo previousVersion è null: il backup dei dati account non è compreso in questo registro.

## Scheda per il commercialista

Portare il modello e un caso riproducibile con prezzo/capitale/debito/costi, non soltanto il ROI. Da validare: regime del soggetto/attività, base imponibile del21% modellato, deducibilità, IVA, contributi, capitale/interessi delle rate, acquisto/lavori esclusi o inclusi, imposta soggiorno comunale, incassi/competenza, locali/studi e applicabilità territoriale. L'incontro può validare o richiedere una nuova versione delle ipotesi; il software non certifica la conformità.

Vendite sospese, trial Investor di 30 giorni e limitazioni PDF restano quelli del codice esistente.
