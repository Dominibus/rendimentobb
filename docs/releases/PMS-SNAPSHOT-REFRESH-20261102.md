# Assistente PMS dopo apertura e filtro prenotazioni

Base: main 66d777ba099cd4d865b0df3f168e00e5e0b617ab.

Riprodotto sul browser con Investor: prenotazioni visibili, ma domande su arrivi odierni e sovrapposizioni restituivano snapshot indisponibile dopo apertura e chiusura della lista.

La lista prenotazioni invalida correttamente portalSnapshotReady. Il lettore conversazionale verificava indisponibilità prima del refresh canonico, rendendo irraggiungibile il recupero. Ora il recupero è consentito esclusivamente per snapshot di account già caricato, con stesso proprietario, stato di caricamento ready, directory e lista presenti, flag di completezza esplicitamente false, accesso Investor/Pro/Admin e bridge esistente. Non rende completo uno snapshot filtrato: richiama il lettore server preesistente e ricontrolla completezza, identità e filtro dopo l'attesa. Non recupera dati null, demo, di altro utente, in caricamento o errore. Refresh fallito e cambi account/filtro non producono risultati né scorciatoie.

Nessuna modifica a Firebase, autorizzazioni, persistenza, prenotazioni, trial, PDF o vendite. Nessuna nuova dipendenza. Aggiornato il riferimento cache del solo motore modificato.

113 test professionali passati, inclusi 16 nuovi casi IT/EN, errori di refresh, cambio account/logout/filtro e confini di accesso. Integrità registro valida, 638 identità finanziarie passate. Suite completa locale: due file richiedono firebase-admin/resend assenti, come sulla base. CI e browser della nuova preview ancora da completare. Nessun merge o deploy manuale.
