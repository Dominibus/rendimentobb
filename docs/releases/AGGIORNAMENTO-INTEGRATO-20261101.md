# Aggiornamento integrato — 1 novembre 2026

## Base e contenuto

Pacchetto manuale per `Dominibus/rendimentobb`, base main esatta
`476f21d25045346a42ff0c1d2f7e5e05ae69cde4`, verificata nuovamente prima della consegna.
Il caricamento su main attiva il normale deploy Vercel. Nessun merge, push o deploy
è stato eseguito durante la preparazione del pacchetto.

Integra i contenuti delle PR #11 (`83e0050f7e19274999bf715deabd274985a345ce`)
e #12 (`8561c12c9d5dc1227a74717f0decba5829ce4a72`). Risolti sette conflitti:
loader, orchestratore e cinque test che verificano i riferimenti cache.
Il loader include entrambi i motori; nell'orchestratore il contesto candidati
precede le risposte PMS, seguite dai percorsi educativi e delle fonti esistenti.
Le verifiche precedenti delle singole PR non costituiscono revisione indipendente
di questa integrazione.

## Novità utilizzabili

- Immobili → Confronta i tuoi candidati: fino a 50 schede manuali/CSV,
  anteprima, criteri espliciti, ordinamenti, motivi e dati mancanti, trasferimento
  dei campi compatibili ad Analizza. Nessuna acquisizione automatica di annunci.
- L'elenco candidati esiste soltanto nella memoria della pagina: ricarica,
  chiusura o cambio account lo eliminano. La tabella non calcola un nuovo ROI
  o punteggio; il calcolo resta nel motore esistente.
- Assistente PMS: risposte autorizzate sugli arrivi di oggi e sulle
  sovrapposizioni, identità della prenotazione e ricontrollo al clic.
  Dati incompleti, struttura sconosciuta e periodi non supportati non diventano
  risposte complete o zero prenotazioni.
- Le richieste su costi effettivi/rendiconto ricevono i limiti e i dati necessari:
  non viene inventata una contabilità B&B assente.
- La pagina candidati riusa header/footer e navigazione mobile. Ritocchi CSS
  circoscritti: numeri allineati e a cifre di larghezza uniforme, righe alternate,
  intestazioni della tabella fisse durante lo scorrimento, focus delle righe e
  messaggio mobile sopra la barra inferiore. Non è un restyling dell'intero sito.

## Login e confini

La PR #13 diagnostica non è inclusa. `js/auth-page.js`, `login/index.html`,
configurazione Firebase, regole Firestore, motore ROI, vendite/trial,
configurazione Vercel e dipendenze sono identici alla base nei file verificati.
Vendite sospese, Investor 30 giorni e restrizioni PDF conservati.

L'errore AUTH-UNCLASSIFIED della preview, riprodotto anche dal fondatore,
non ha una causa dimostrata. Il pacchetto non è presentato come correzione del
login. Non modificare password, domini o autorizzazioni per tentativi.
Nessuna scrittura su dati reali, email, sincronizzazione OTA o pagamento.

## Verifiche sull'integrazione finale

- `npm test`: 2.373 test passati, zero fallimenti, zero saltati.
- Sette nuovi casi di integrazione eseguono i moduli nell'ordine del loader:
  candidati IT/EN, identità PMS IT/EN, OMI su Free IT/EN, isolamento del candidato
  al cambio account/pagina.
- `node tests/rc213-financial-identities.mjs`: 638 controlli passati.
- `python3 -m unittest discover -s tests -p '*.py'`: 37 test passati.
- `node scripts/audit-source-registry.mjs`: integrità valida di 110 asset;
  nessuna verifica di disponibilità/attualità remota.
- `git diff --check`: passato.
- I file scaricati delle PR sono stati verificati contro i rispettivi Git blob.

Il primo avvio della suite non trovava due dipendenze locali. Ripetuta con
firebase-admin 13.10.0 e Resend 3.5.0 già disponibili, compatibili con i vincoli
del progetto, senza cambiare package.json/lockfile: tutti i test passano.

Browser della versione combinata, layout desktop/mobile e percorso Pro
autenticato end-to-end non eseguiti. Nessuna nuova esecuzione di emulatori
Firestore o certificazione di produzione. I test VM/DOM non sono prove browser.

## Caricamento manuale

1. Estrarre lo ZIP dell'aggiornamento.
2. Nel repository selezionare main. Se la base non è più `476f21d`, confrontare
   le nuove modifiche prima di caricare: non sovrascrivere un main avanzato.
3. Add file → Upload files: trascinare le cartelle estratte `css`, `data`,
   `docs`, `examples`, `immobili`, `js`, `tests`, `tool` nella radice del repository.
   Non caricare il file ZIP e non creare una cartella esterna aggiuntiva.
4. Controllare i percorsi: per esempio `js/chatbot-loader.js` e
   `immobili/candidati/index.html`. Eseguire un unico commit completo.
5. Attendere CI Regressioni prodotto e deploy Vercel del nuovo commit.
   Questo pacchetto non ha ancora un proprio risultato CI remoto.
6. Non usare successivamente Merge sulle vecchie PR #11/#12: i loro contenuti
   sono già integrati dal caricamento. Dopo verifica del commit, documentare
   l'integrazione e gestirne la chiusura separatamente. PR #13 resta distinta.

## Collaudo dopo deploy

- Immobili → candidati; IT/EN, 390/1440 px, tastiera e scorrimento tabella.
- Inserimento manuale e CSV sintetico: anteprima senza aggiunte, conferma,
  duplicati, ordinamento, criteri e dati mancanti.
- Spiega candidato A/B → Analizza: stesso riferimento e valori; nessun default
  economico che completi silenziosamente un input candidato mancante.
- Login con la normale interfaccia di produzione; non condividere credenziali.
- Dashboard/assistente con dati sintetici autorizzati: arrivi oggi, conflitti,
  struttura sconosciuta, periodo dicembre, OMI/prezzi per Free.
- Stessa simulazione → salvataggio → riapertura → PDF consentito dal piano.
- Cambio proprietà, account/logout e sostituzione PDF: nessun contesto residuo.

## Ripristino

Conservare lo SHA del singolo commit caricato. Il metodo preferito è un revert
di quel commit: ripristina i file precedenti ed elimina soltanto i file aggiunti
da questo aggiornamento. Non usare reset forzati, non toccare record Firestore.
È fornito anche uno ZIP separato con gli originali dei file sostituiti e la
lista dei nuovi percorsi da rimuovere soltanto durante un ripristino.

## Revisione indipendente Codex

Verificare base e diff effettivo; caricare entrambi i motori una sola volta e
controllarne la precedenza; non rimuovere asserzioni per superare i test.
Ripetere i comandi sopra e i casi delle checklist candidate/PMS. Verificare
integrità del registro, assenza di cambi finanziari/auth/rules, isolamento account,
gestione dei dati mancanti e divieto di attribuire OMI ai rendimenti.
Tenere separati esiti locali, CI del commit pubblicato e collaudo browser.
