# RC192 — Diagnosi e impatto prima dell’implementazione

Base RC191: main GitHub 2def26a9403532ea366c3e211e846a3fda88397e, pubblicazione osservata nel simulatore. Nessuna scrittura di produzione prevista.

Richiesta: attivare riferimenti territoriali documentati senza nuovi costi; verificare PMS.

Fonti: Inside Airbnb pubblica gratuitamente gli snapshot dell’ultimo anno con CC BY 4.0. Scaricati una sola volta quattro file listings dettagliati dai collegamenti pubblici. La fonte distingue prezzi pubblicati e stime di occupazione; il calendario non prova le notti vendute. Non riutilizzare stime di occupazione come consuntivo. OMI riguarda quotazioni immobiliari, non ADR; ISTAT dà contesto turistico, non tariffe dello specifico appartamento. Nessuna fonte citata come sostegno ai vecchi numeri interni.

Intervento a basso rischio: nuova serie indipendente di aggregati di prezzi pubblicati per zona, tipologia esatta, capienza, mese di check-in quotato e fascia durata. Usare soltanto preventivi in EUR disponibili, non mensili, con date e subtotal notti documentati. Quotazione base per notte = nightly_subtotal / notti; esclude dal metodo sconti, pulizie e imposte separati, senza equiparare il prezzo al ricavo incassato. Nessuna sostituzione automatica degli input del simulatore. Mostrare mediana e quartili soltanto con almeno 10 osservazioni; soglia interna, non garanzia statistica. Esporre campione, fonte, periodo effettivo di osservazione, periodo dei soggiorni e limiti. Niente host, ID, indirizzi, coordinate o annunci redistribuiti. Aggiornamenti offline/manuali, senza chiamate esterne dai visitatori.

PMS: disponibilità fissa e unità singola sono limiti architetturali già dichiarati, non risolvibili con una semplice variazione della percentuale. Non aggiungere campi di chiusura che Firestore, API e calendario non interpretano. Verificare calendario, stati, competenza ricavi, documenti, tassa, attività, pricing e demo mediante percorsi pubblici e fixture; riportare separatamente ciò che richiede login. Eventuali correzioni di sola presentazione/validazione demo non alterano record utente o formule.

Preservare ROI/mutuo, piani, permessi, Firestore, cron/email e vendite sospese. Pacchetto modificati/nuovi soltanto; nessun provider a pagamento o migrazione.
