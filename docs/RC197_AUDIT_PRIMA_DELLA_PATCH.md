# RC197 · Audit primo visitatore, prima delle correzioni

Base pubblicata: RC196, GitHub main 9274968a4ba1c4ee859c1600bb397aa48a2cc91f, 25 ottobre 2026. Controllo browser desktop, non autenticato. Nessuna modifica in produzione o ai dati degli account. Le prove di inserimento riguardano soltanto la demo in memoria esplicitamente indicata.

Riproduzione screenshot: il paragrafo “Due gestioni dedicate…” usa contemporaneamente rb158-description e rb158-shell. La regola della descrizione impone margin:0 e max-width:510px e prevale sulla centratura della shell. Browser: paragrafo x=0, larghezza=510px; sezioni vicine x=84, larghezza=1180px, viewport=1348px. Non è un overflow orizzontale del documento: è un blocco staccato dalla griglia, da ricomporre con un contenitore dedicato.

PMS commerciale demo: il primo accesso apre Scenari anziché Oggi. Il render temporaneo senza workspace cambia la vista prima che il caricamento termini. La prima impressione è un modulo lungo invece del cruscotto operativo. Nell’editor compare inoltre “Simulazione vuota pronta” con tre contratti caricati e una sezione pubblica che dichiara “non è ancora il PMS commerciale”: testi fuori contesto, da correggere senza alterare i dati.

Calendario commerciale: scelta R2, poi cambio del mese → selezione torna a R1. Non altera dati, ma può indurre a leggere la stanza sbagliata. Da mantenere la selezione durante il ridisegno.

Prova demo operativa: gennaio contrattuale 1.910 euro, incasso iniziale 1.200 e costo 120. Aggiunto solo in memoria un incasso fittizio A2 da 450: registro mostra A2 riconciliato, Autopilot con refuso “incasi” riporta incassi 1.650 e saldo 1.530, con fonte e revisione corrette. Attività completata passa a Completata/Riapri. Navigazione successiva funziona dopo il completamento dell’operazione.

Seguono verifica delle restanti schermate pubbliche e responso dei sei profili. Le valutazioni di propensione alla prova sono giudizi di percorso, non percentuali di conversione o feedback di sei persone reali.
