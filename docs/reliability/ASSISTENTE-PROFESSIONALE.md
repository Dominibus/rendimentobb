# Assistente PMS: prima evoluzione professionale

Base: main `476f21d25045346a42ff0c1d2f7e5e05ae69cde4`. Intervento circoscritto del 31 ottobre 2026, successivo all'audit funzionale. Nessuna modifica a motori finanziari, dati persistenti, autorizzazioni, pagamenti o fonti territoriali. Vendite sospese, Investor 30 giorni e restrizioni PDF invariati.

## Prima e dopo

| Richiesta IT/EN | Prima, riprodotto localmente | Risposta implementata |
| --- | --- | --- |
| Quali strutture hanno arrivi oggi? / Which properties have arrivals today? | Conteggio aggregato, senza elenco delle strutture | Immobile, date, ID e stato salvato dei soggiorni con arrivo oggi; apertura della prenotazione esatta |
| Ci sono prenotazioni sovrapposte? / Are there overlapping bookings? | Conteggio delle prenotazioni, senza controllo delle sovrapposizioni | Numero di prenotazioni coinvolte in almeno una sovrapposizione, distinto dal numero di coppie; riferimenti apribili |
| Quali strutture hanno costi superiori alle previsioni? / Which properties have costs above forecast? | IT: prezzi abbonamenti; EN: risposta operativa generica | Limite esplicito: le sole prenotazioni non consentono un confronto dei costi effettivi; dati necessari elencati, nessuna classifica inventata |
| Quali dati mancano per completare il rendiconto? / What data are missing to complete the owner statement? | Risposte IT/EN non uniformi | Checklist generale di requisiti, distinta dalla verifica personale di completezza; ricavi prenotati separati da incassi/costi |

Le domande sulle pulizie mantengono l'Autopilot esistente; non è stata introdotta una nuova gestione attività. La vista compatta delle eccezioni, un registro contabile B&B e i connettori esterni restano lavori separati.

## Uso e limiti

1. Aprire Dashboard → Gestione con account autorizzato e caricare il PMS.
2. Selezionare l'immobile o la vista complessiva. Le risposte dichiarano l'ambito.
3. Chiedere gli arrivi di oggi oppure le sovrapposizioni. Per gli account, quando disponibile, viene richiesto un nuovo snapshot tramite il lettore server esistente.
4. Controllare immobile, date, ID e stato prima di aprire la scorciatoia. L'apertura non salva e non completa un'attività.

Il giorno civile usa `checklistDay` in Europe/Rome. Gli arrivi sono soggiorni con check-in oggi e stato attivo, inclusi quelli già arrivati; pending/cancelled sono esclusi. Una prenotazione con stato checkout/completed conserva la data di arrivo storica: lo stato è visibile, non trasformato in un arrivo ancora da gestire.

Le sovrapposizioni riguardano l'intero elenco caricato nell'ambito selezionato, non un periodo implicito. Check-out escluso, secondo `evaluateAvailability`. Richieste per altri periodi ricevono istruzioni per il calendario, senza sostituzione silenziosa del periodo. Nessuna verifica OTA o degli annunci.

La scansione ordina i soggiorni per immobile e data, conservando l'intervallo col check-out più lontano; ogni confronto usa la funzione canonica di disponibilità. Non introduce una diversa regola di prenotazione. È limitata a 2.000 righe: oltre questo limite chiede di restringere l'ambito e non dichiara assenza di conflitti.

Sono mostrati al massimo cinque record e cinque scorciatoie; il numero totale di corrispondenze resta esplicito. Date, stati o identificativi incompleti/duplicati rendono il controllo parziale. I record senza ID univoco non diventano destinazioni apribili. Il limite mono-unità del PMS resta invariato: non è un controllo di capacità per strutture multicamera.

Caricamento, errore, dati indisponibili, elenco vuoto e demo restano distinti. Cambio account/immobile durante un refresh, logout o refresh fallito impediscono di riutilizzare il risultato precedente. Le scorciatoie riusano il validatore e l'handler esistenti, che ricontrollano accesso e contesto al clic. Nessuna nuova autorizzazione o scrittura.

La checklist contabile è educativa, disponibile anche a Free, e non legge risultati riservati. Non certifica quali documenti manchino al singolo utente. Le sole prenotazioni non provano pagamenti, spese sostenute, imposte o saldo dovuto al proprietario. Non si importano costi dal modulo commerciale nel PMS B&B.

## Verifiche locali riproducibili

```bash
node --test --test-concurrency=1 \
  tests/pms-professional-answers.test.js \
  tests/pms-calendar.test.js tests/pms-tasks.test.js \
  tests/pms-availability.test.js tests/booking-import.test.js \
  tests/rc130-pms-operational-report.test.js \
  tests/rc131-property-performance.test.js \
  tests/rc152-booking-export.test.js \
  tests/pms-property-selector-speed.test.js \
  tests/pms-daily-checklist.test.js \
  tests/chatbot-evidence-a1-a4.test.js \
  tests/pms-autopilot.test.js tests/pms-preparation.test.js \
  tests/pms-task-guest-report.test.js \
  tests/rc82-calendar-multiple.test.js \
  tests/pms-booking-service.test.js tests/booking-import-server.test.js
node tests/rc213-financial-identities.mjs
git diff --check
```

Le prove conversazionali caricano i moduli nell'ordine del loader reale, in VM con dati sintetici. I nuovi test verificano le quattro domande IT/EN, contesto e azioni, refresh fallito/obsoleto, scope, demo, accesso Free, date errate, stati, ID duplicati e periodi non supportati. La scansione ottimizzata è confrontata con tutte le coppie tramite la funzione canonica su 150 insiemi deterministici. La suite calendario include tre fusi orari.

Riproduzione prima della patch: sui primi 33 nuovi casi, con il nuovo helper puro ma loader/orchestratore/evidence originali di main, 23 falliscono e 10 passano. Dopo la correzione e gli ulteriori due controlli sullo scan/bridge: 35 nuovi casi passati. La regressione estesa comprende 294 test; 638 identità finanziarie passate. Non è una nuova esecuzione della suite completa, degli emulatori o del collaudo browser.

La prima CI completa ha eseguito 2.251 casi: cinque controlli statici richiedevano ancora il precedente identificativo cache dell'orchestratore. Sono aggiornati esclusivamente quei riferimenti in RC169/174/189/193/194, conservando le altre asserzioni. Il nuovo esito CI va verificato sul commit finale; non confondere il primo run fallito con i test locali mirati o con la preview Vercel.

## Correzioni dopo la revisione indipendente di a7dcc882

La revisione Codex ha dimostrato tre P2 non intercettati dai test precedenti. Il collaudo browser di accettazione resta sospeso fino al loro controllo sul nuovo commit:

- **Struttura sconosciuta:** il testo viene interpretato in modo conservativo. I nomi corrispondono per intero; nomi sconosciuti, nomi misti o suffissi non riconosciuti richiedono selezione nella Dashboard. Non si sostituisce Villa Gamma con l'elenco generale. Anche qualificatori residui non compresi bloccano la risposta; questa prima versione può quindi chiedere di riformulare frasi legittime anziché tentare un'interpretazione incerta.
- **Completezza apparente dopo il filtro:** prima della scansione si verificano directory e riferimenti dell'intero snapshot, inclusi ID duplicati fuori dal filtro e prenotazioni orfane. Un errore restituisce `data_quality`, `complete:false` e nessuna scorciatoia. Non vengono mostrati nomi o ID scartati. È un controllo globale conservativo: filtrare una struttura sana non risolve un'anomalia d'identità altrove. Non modifica o ripara record. Il controllo viene ripetuto anche al clic su una scorciatoia professionale precedentemente generata.
- **Periodo ignorato:** mesi IT/EN, abbreviazioni, giorni della settimana, anni, trimestri, stagioni e date numeriche non vengono sostituiti dall'intero elenco. Si richiede il calendario, con `period_required` e nessuna prenotazione nella risposta. Anche gli overlap di oggi sono rifiutati, perché il controllo disponibile opera sull'intero elenco. Un mese nel nome completo di una struttura riconosciuta non viene interpretato come periodo.

Riproduzione iniziale dei nuovi casi: 44 fallimenti su 45 prima della correzione. La suite professionale passa ora 87 test (35 originari e 52 aggiunti), compresi ulteriori controlli su scorciatoie, nomi completi e richieste brevi. La regressione mirata passa 346 test; il nuovo esito CI completo resta distinto e va letto sulla PR. Nessun nuovo controllo browser eseguito in questa correzione.

Per il controllo indipendente aggiungere: `Villa Gamma` IT/EN, Casa Alfa + Villa Gamma, Casa Alfa Sud, proprietà mancanti/sconosciute, ID duplicati nell'altra struttura, directory con ID duplicati, dicembre/December e mesi restanti, periodi numerici, cambio qualità dello snapshot prima del clic. Verificare che nessuna di queste anomalie generi `complete:true` o scorciatoie verso un immobile sostitutivo.

## Regressione di routing segnalata su 72514c41

Il riesame indipendente ha confermato la chiusura dei tre P2 precedenti, ma ha riprodotto un nuovo P2: la presenza nella Dashboard faceva interpretare qualsiasi domanda sui conflitti come richiesta PMS. Le domande OMI/annunci perdevano così la spiegazione pubblica e potevano richiedere un piano a Free.

La selezione dell'intento ora richiede un riferimento esplicito a prenotazioni/bookings/reservations. Solo le richieste brevi delimitate (ad esempio «Sovrapposizioni?» oppure «Overlaps in December?») possono usare la Dashboard come contesto. Parole generiche come conflitti, overlap o Dashboard non stabiliscono da sole l'intento operativo. Nessun accesso o caricamento PMS viene richiesto per la domanda pubblica OMI riprodotta.

Aggiunti 10 test: otto combinazioni IT/EN e Free/Investor sulle domande OMI/annunci, una verifica di richieste generiche estranee al PMS e una verifica delle richieste operative ancora disponibili. Prima della correzione 9 di questi 10 test falliscono; dopo la correzione la suite professionale passa 97 casi. Le domande usano anche uno snapshot assente e un refresh che fallirebbe il test se invocato: la risposta pubblica non dipende dai dati account.

Per Codex: ripetere le domande sui conflitti fra quotazioni OMI e annunci, anche in inglese e con Free, senza dati PMS caricati; verificare `omi_evidence` senza richiesta di upgrade o selezione immobile. Ripetere i tre P2 precedenti e i percorsi prenotazioni. Collaudo browser ancora non eseguito; nessun merge o deploy in produzione.

## Controllo indipendente Codex

- Verificare base e diff esatti; nessuna modifica a formule, rules, endpoint, persistenza o condizioni commerciali.
- Ripetere i comandi e controllare separatamente l'esito CI sul commit della PR.
- Leggere il bridge nella Dashboard: solo esposizione di funzioni pure già importate/riusate.
- Confrontare gli intervalli annidati, adiacenti, cancellati/pending e le proprietà differenti col validatore canonico.
- Controllare fallimenti di refresh e cambio identità/scope: nessun dato precedente nella risposta.
- Verificare che nessuna risposta su costi/rendiconto dichiari una verifica personale inesistente.
- Confermare che non siano state aggiornate impronte del registro per aggirare controlli: i file modificati non sono asset censiti nel registro corrente.

## Collaudo Work/browser ancora necessario

Su preview, con account sintetico autorizzato e nessuna scrittura ai dati reali:

- [ ] IT/EN a 390 e 1440 px: quattro domande, risposte leggibili e scorciatoie.
- [ ] Arrivo oggi, già arrivato, nessun arrivo, pending/cancelled e data non valida.
- [ ] Due soggiorni sovrapposti nello stesso immobile e due adiacenti senza conflitto.
- [ ] Più immobili, selezione/filtro, cinque o più corrispondenze e identificativi univoci.
- [ ] Clic verso il record esatto; cambio proprietà/account e logout prima del clic.
- [ ] Disconnessione durante il caricamento: nessun dato vecchio presentato come appena verificato.
- [ ] Free e pagine diverse dalla Dashboard: limiti espliciti, nessun risultato personale esposto.
- [ ] PDF corrente, OMI, simulatore, piani e workspace commerciale mantengono i propri percorsi.
- [ ] Domande sulle pulizie e checklist precedenti continuano a funzionare.
- [ ] Controllare assenza di nuove scritture, invii email, attività completate o attivazioni commerciali.

## Convivenza con PR #11 e rilascio

PR #11 candidati resta separata e non viene modificata o integrata. Loader e orchestratore sono punti di integrazione condivisi: prima del secondo merge controllare che sopravvivano sia il modulo candidati sia la precedenza delle nuove risposte PMS. Risolvere eventuali conflitti soltanto sui punti interessati, poi ripetere regressioni e test candidati. Nessuna dipendenza funzionale della presente patch dalla PR #11.

La PR di questa patch non viene integrata automaticamente. Main/produzione restano invariati; il push può attivare le preview automatiche già configurate, che non equivalgono al rilascio in produzione o al collaudo applicativo. Netlify non è il percorso di rilascio e non viene modificato.
