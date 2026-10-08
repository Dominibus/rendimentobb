# RC58 — applicazione della patch

Questo archivio contiene esclusivamente file nuovi o modificati rispetto a RC57 già caricata. Le cartelle sono alla radice dello ZIP: nessuna cartella contenitore e nessun progetto completo.

1. Conservare una copia della versione attuale o il commit RC57.
2. Estrarre e sovrascrivere i file mantenendo i percorsi. Aggiungere anche i nuovi file JS/CSS. Non sostituire l'intero repository e non eliminare altre cartelle.
3. Commit/deploy del progetto sul provider abituale. La patch non modifica `firestore.rules`, segreti, abbonamenti o dati Firebase. Non effettua deploy automatici.
4. Ricaricare il sito e controllare Login → Pro → tool → Dashboard; aprire i parametri avanzati. Verificare che restino corretti anche Free e Investor.
5. Verificare le risposte HTTP (HSTS, Permissions-Policy e no-store privato), canonical, sitemap e noindex dopo il deploy.
6. Seguire i gate nel rapporto prima di dichiarare completata la verifica in produzione.

Controlli locali: `npm test`, 650 superati; sintassi JS modificati; inventario HTML. I test Firebase Emulator e la verifica visiva/mobile/PDF completa restano aperti.

Avvertenza operativa: una simulazione Pro/Investor può salvare un'analisi. Usare un account di prova e riconoscere i dati di test; la patch rende esplicito il salvataggio.

Rollback: ripristinare i file dal commit RC57. Non servono rollback dei dati: la patch non migra collezioni esistenti. La nuova registrazione aggiunge metadati dei termini, senza attribuire consensi commerciali o di cessione lead.

Manifest: `docs/RC58-FILE-MODIFICATI.json` elenca tutti i file applicativi e documentali del pacchetto con SHA-256; il manifest stesso non si auto-elenca.
