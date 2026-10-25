# RC196 · Base e decisioni prima dell’intervento

ZIP fornito: rendimentobb-main (28).zip, commit c513762e27a6319c75cc48fd4c54104d8f44155f, RC194. RC195 non ancora presente: viene inclusa cumulativamente. Nessun AGENTS.md. Nessuna distribuzione automatica.

Sei profili: proprietario di casa, investitore, gestore B&B, consulente immobiliare, proprietario di locale, gestore di studi condivisi. La home mostra già i sei percorsi ma il messaggio dominante è B&B e il commerciale è presentato come modulo isolato. Il pianificatore non salva e il calendario turistico non rappresenta stanze/fasce. Non va riutilizzato per contratti commerciali.

Feedback precedenti da applicare: destinatario e utilità chiari in pochi secondi; casi pratici dichiarati fittizi; fonti/date/zone per dati territoriali senza spacciare ipotesi per benchmark; priorità operative invece di sole metriche; distinzione fra simulazione e risultati registrati. Le ricostruzioni dei feedback sono contesto di lavoro, non nuove testimonianze commerciali pubblicabili.

## Implementazione

Area /gestione-commerciale/ IT e /en/gestione-commerciale/ EN, con demo esplicita che usa lo stesso modello applicativo. Scenari salvati e modello operativo confermato separati. Calendario stanze/fasce, registro incassi/rimborsi/costi e attività. Autopilot locale sui dati del workspace caricato, con fonte e periodo, senza API AI aggiuntive e senza azioni automatiche.

Backend multiplex nell’endpoint esistente guest-report con action dedicata commercial_workspace, handler separato e token Firebase revocation checked. Archivio commercial_workspaces, indice per proprietario e rate limiter dedicati; nessuna modifica ai documenti B&B. Accessi API owner-only; client Firestore diretto vietato dalle regole catch-all esistenti. Lettura dei propri archivi anche dopo downgrade, scritture Investor/Pro/trial attivo/admin. Concorrenza per revisione e transazioni, idempotenza per retry, limiti documenti/payload/archivi.

Incassi per data e periodo di competenza distinti; confrontare importi con IVA compresa su entrambi i lati. Nessun risultato senza IVA se manca il trattamento. Differenza tra canone e incasso non equivale a morosità senza termini di pagamento. Movimenti annullabili con traccia, non cancellati. Contratti con movimenti protetti da modifica; nessun paziente, prestazione clinica o tassa soggiorno. Documenti sanitari e fatturazione fiscale fuori perimetro.

## Verifiche

Test autorizzazione, accessi tra account, trial/downgrade, versioni stale, retry e collisioni concorrenti; calcoli mensili/annui, IVA, ledger per competenza e per cassa, storni e attività; UI reale in IT/EN con salvataggio/caricamento, conferma, modifiche e logout. Regressione calcoli, PDF, chatbot e PMS B&B. Controllo visivo pubblico della base; verifica esplicita dei limiti di collaudo della nuova patch prima della pubblicazione.
