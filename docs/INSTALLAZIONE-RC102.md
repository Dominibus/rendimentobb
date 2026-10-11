# RC102 — Recesso online, Termini e Abbonamenti

Base richiesta: progetto con RC101 già applicata. Lo ZIP contiene file completi da sostituire/aggiungere nelle stesse cartelle del repository; non è il progetto intero. Conservare una copia della versione attuale prima del caricamento.

1. Estrarre lo ZIP e caricare tutti i file mantenendo la struttura delle cartelle. Non caricare lo ZIP come singolo file nel sito. I file `docs` e `tests` servono per istruzioni e verifiche, non contengono configurazioni segrete.
2. Attendere il deploy Vercel e verificare che sia riuscito. Non sono richieste nuove variabili: sono usate Firebase Admin e Resend già presenti. Le funzioni API restano 12. Il cron già configurato è riutilizzato, senza aggiungere job.
3. Aprire `/withdrawal.html#withdrawal-form` anche senza login, da mobile e desktop. Verificare il collegamento nel footer, nei Termini e nell’area Abbonamento di Free, Investor, Pro e Pro Annuale. Il collegamento è disponibile anche per Investor in prova.
4. Eseguire una richiesta chiaramente di test, usando un proprio indirizzo email e nel campo contratto “TEST RC102 — nessun contratto da annullare”. Controllare il riepilogo; solo “Conferma recesso” trasmette la dichiarazione. Scaricare la ricevuta TXT, controllare dichiarazione, riferimento, data e ora UTC. Controllare email e spam.
5. Verificare che il gestore riceva la notifica a `rendimentobb@gmail.com` e che la richiesta sia presente in Firebase Firestore, raccolta `_withdrawal_requests`. Contrassegnare manualmente questa richiesta come test nel pannello riservato; non trattarla come un recesso reale.
6. Nell’area Abbonamento verificare che “Gestisci rinnovo e fatture su Stripe” rimanga distinto dal recesso e che il download delle condizioni di un acquisto precedente riporti la versione originariamente accettata.

## Gestione operativa indispensabile

La funzione registra e comunica la dichiarazione, non esegue automaticamente rimborsi o modifiche Stripe. Il gestore deve controllare le notifiche, identificare il contratto e trattare il recesso e l’eventuale rimborso entro i termini applicabili. Un invio pubblico non autorizza ad annullare l’abbonamento di un’altra persona senza verifica.

La ricevuta viene registrata prima dell’invio email. Se il provider rifiuta l’email, il cliente può scaricare subito la ricevuta e riprovare l’invio senza cambiare riferimento/data. Il cron giornaliero già previsto alle 07:00 UTC riprova fino a 5 richieste per esecuzione; non assicura consegna o gestione del recesso entro una determinata ora. Controllare gli stati `receiptStatus`, `operatorStatus`, `emailPending`, `attempts` e `_pms_jobs/withdrawal_receipts` (`pending`/`needsAttention`). Se vi sono richieste in attesa, gestire tempestivamente il problema e contattare il cliente: non attendere passivamente il cron. Anche lo stato `sent` significa accettazione da parte del provider, non conferma di lettura o recapito.

Il contenuto delle richieste è riservato al backend e agli amministratori Firebase; non è inserito in leads, marketing o email funnel. Gestire conservazione e cancellazione in base alla politica documentata, senza eliminare prove necessarie a richieste aperte o obblighi applicabili.

Il deploy e il test email reale non sono stati eseguiti dall’audit locale. Rimangono da completare i dati identificativi/geografici del gestore, le condizioni di trattamento dei dati ospiti (DPA), la politica effettiva di conservazione e la verifica del piano/contratti dei fornitori. RC102 non è una certificazione di conformità complessiva del portale.
