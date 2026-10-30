# A5 — Proposta separata per la provenienza delle nuove analisi

Stato: proposta da revisionare, non implementata dalla PR A1–A4. Nessuna modifica a schema Firestore, salvataggio, record storici o esportazioni. Integra il disegno in ARCHITETTURA.md e richiede revisione separata prima dell'implementazione.

## Contratto da valutare

Un envelope immutabile per una nuova analisi dovrebbe identificare:

- `schemaVersion`, `analysisId`, `calculatedAt`: versione del contratto, identità e istante del calcolo, distinti dalla data di salvataggio.
- `model`: ID/versione, commit e manifest delle dipendenze finanziarie/assunzioni con hash. L'hash del solo entrypoint non basta.
- `inputs`: nome, valore, unità, origine (`user_supplied`, `internal_assumption` o altra classificazione documentata). Assente resta null; zero esplicito resta zero.
- `assumptions`: ipotesi effettivamente applicate e loro versione, inclusi limiti del modello fiscale senza attribuirgli validazione professionale.
- `datasets`: solo serie realmente usate, con ID/versione/hash, editore, documento/URL, territorio/granularità/unità, periodo osservato, pubblicazione se nota, acquisizione e trasformazioni. `usage` distingue `calculation_input` e `context_only`.
- `checks`: tipo del controllo, riferimento della revisione ed eventuale istante osservato. Un controllo di integrità non diventa aggiornamento della fonte né ultima pubblicazione.
- `limitations`: mancanze, non applicabilità e revisioni aperte.

Metadati sconosciuti null; nessuna data corrente introdotta come data storica. Nessun dato ospiti, contatto o dato sanitario nell'envelope. Dati di autorizzazione e proprietà restano affidati ai controlli esistenti, non ai claim dell'envelope.

## Passaggi e criteri di accettazione per la futura PR

1. Approvare schema, minimizzazione, dimensioni, compatibilità e verifica del manifest con i responsabili del modello e della persistenza.
2. Produrre il manifest dal calcolo nuovo e trasferire lo stesso contenuto a salvataggio, riapertura, dashboard, PDF/CSV e assistente; non ricostruirlo dal registro globale al momento dell'esportazione.
3. Verificare campi, unità, hash e input realmente usati. Un dataset presente nella pagina ma estraneo alla formula va marcato solo contesto.
4. Storici senza envelope: dichiarare «Versione fonti/modello non disponibile». Nessuna migrazione implicita o attribuzione della versione corrente.
5. Eventuale ricalcolo: scelta esplicita, nuovo record/ID, riferimento all'originale e confronto; originale preservato. Nessun ricalcolo alla semplice apertura.
6. Collaudare continuità del manifest, campi null/zero/negativi, vecchio schema, dataset non disponibile, cambio account/proprietà e restrizioni PDF. Rifiutare manifest contraddittori, non correggerli silenziosamente.
7. Documentare rollback della nuova funzionalità senza riscritture massive dei record e senza perdita dell'originale.

Fiscalità, IVA, condizioni di riuso e interpretazioni professionali restano revisioni distinte. La provenienza rende rintracciabile un risultato, non lo certifica.
