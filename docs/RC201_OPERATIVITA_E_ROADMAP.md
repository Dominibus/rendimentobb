# Autonomia operativa e condizioni di lancio

26 ottobre 2026. Questo documento è una procedura proposta e una valutazione del codice, non una misurazione storica del tempo amministrativo.

## Cosa lavora automaticamente

Il cron principale è `/api/cron-funnel`, pianificato alle **07:00 UTC ogni giorno** (08:00 in Italia il 26 ottobre; 09:00 durante l’ora legale). Elabora promemoria e notifiche entro budget di tempo, recuperi già previsti, registrazione esiti e alcune pulizie per scadenza. Code e notifiche contemplano retry, idempotenza e revisione manuale in condizioni incerte. I webhook Stripe sono un percorso distinto; l’assenza dell’admin non ne dimostra né impedisce il funzionamento.

L’Operations Center legge esiti memorizzati. Soglia job: 36 ore; fotografia della schermata: 5 minuti. Il riepilogo email dipende dal cron. **Se il cron non parte, quel riepilogo non è un rilevatore indipendente del fermo.** “Accettata dal provider” non significa email consegnata al destinatario. Le code mostrate sono campioni limitati, non totali certificati.

## Assenza dell’amministratore

| Assenza | Se i servizi funzionano | Se compare un’eccezione | Conclusione |
|---|---|---|---|
| 3 giorni | Le automazioni pianificate possono continuare senza approvazione manuale | Supporto, interessi ai piani, invii incerti e anomalie possono attendere. Un job fermo supera già la soglia di 36 ore | Non è dimostrata gestione senza presidio; servono disponibilità a intervenire e controllo indipendente |
| 7 giorni | Nessuna necessità prevista di inserire prenotazioni al posto dei clienti | Possono accumularsi revisione manuale, incidenti e richieste con tempi propri | Prevedere un referente e accessi adeguati, senza condividere password |
| 14 giorni | La sola permanenza online non prova salute, correttezza degli invii o integrità dei dati | Un errore non rilevato può protrarsi, le fonti non si aggiornano da sole e alcune richieste non possono essere rinviate arbitrariamente | Non considerare oggi garantita un’assenza di due settimane senza copertura |

I test RC201 simulano il tempo per verificare che una lettura admin segnali job vecchi a 3/7/14 giorni. Non spengono processi reali, non provano due settimane di esercizio né dimostrano consegna degli allarmi.

## Routine sostenibile proposta

- Nei giorni di attività: controllare segnalazioni, esecuzione recente, code da rivedere e richieste utenti; obiettivo 5–10 minuti se non ci sono anomalie.
- Ogni settimana: 30–60 minuti per esiti, supporto, quote/costi dei fornitori, criticità aperte e confronto dei dati del funnel realmente disponibili.
- Periodicamente: verificare nuove pubblicazioni delle fonti, dipendenze, accessi, backup e ripristino secondo una procedura concordata. Il rinnovo degli aggregati territoriali è manuale, non automatico.

Queste durate sono stime organizzative a basso volume. Non sono state cronometrate e possono aumentare molto in caso di incidente, cambi normativi o crescita degli utenti. Non esistono dati sufficienti per stimare il costo di assistenza per cliente.

## Ordine delle attività

### Indispensabile per chiudere il consolidamento tecnico

1. Revisionare e pubblicare manualmente RC201, poi verificare i 12 link città, i filtri della ricerca, i campi mancanti e i messaggi IT/EN.
2. Eseguire con un account di prova un ciclo completo: verifica email → Investor → analisi salvata → recupero → immobile/prenotazione → CSV → export ammesso dal piano. Conservare l’evidenza dei piani che devono negare il PDF.
3. Ripetere upload dei PDF reali nel lettore e confronto con la stessa analisi. Collaudare iPhone reale, tastiera, modali e calendario; misurare performance mobili senza confondere laboratorio e dati sul campo.
4. Dimostrare backup e ripristino isolato; stabilire quanto dato può essere perso e quanto tempo può durare il ripristino. Verificare le impostazioni effettive del cloud, non solo il file delle regole.
5. Verificare un controllo indipendente di disponibilità/mancate esecuzioni e una procedura incidenti. Prima configurare e collaudare ciò che i servizi già in uso consentono; nessuna nuova API a pagamento prevista.

### Prima della commercializzazione

Validazione con commercialista e avvocato di forma dell’attività, fiscalità/fatturazione, contratti e recesso, privacy/ruoli e fornitori, conservazione, eventuale compatibilità lavorativa. Verifica separata di ricavi, rimborsi, contestazioni e assistenza. Gli obblighi sui dati riguardano anche i tester. La sospensione degli acquisti resta attiva fino alla decisione autorizzata.

### SEO e validazione del valore

Leggere Search Console per query–pagina, paese e dispositivo con periodi omogenei; verificare cause delle esclusioni; confrontare gli ingressi generici con l’apertura demo/prova e l’uso successivo disponibile. Evitare nuove landing ripetitive. Richiedere ai tester di completare un caso senza guida in diretta e annotare blocchi, tempo, comprensione delle ipotesi ed eventuale ritorno. Non contare inviti, curiosità e call come uso completo o acquisti.

### Proposte separate, non applicate

- Consolidamento `.com` → `.it`: analizzare prima webhook/callback, poi proporre una configurazione reversibile con test degli endpoint.
- SEO inglese completa: valutare in futuro URL e canonical coerenti; l’interfaccia bilingue non la dimostra. Non è prioritaria per la validazione italiana.
- Semplificazione futura: ridurre gradualmente duplicazioni nel grande `app.js`, nella dashboard e nei livelli del chatbot, proteggendo le dipendenze con test. Nessuna riscrittura generale ora.

## Criterio di uscita

**Oggi: pronto per test controllati.** Per “tecnicamente pronto” devono essere chiusi i controlli essenziali sopra e le anomalie bloccanti eventualmente emerse. Per “pronto per commercializzazione” occorrono anche conferme legali/fiscali/contrattuali e un presidio operativo dimostrato. Per “autogestito” servono misure reali di eccezioni, tempi di supporto e rilevazione/ripristino dei guasti; non basta avere un cron e una dashboard admin.
