# RC193 — giudizio e verifica dei quattro profili

## Giudizio sull’idea

Favorevole a un MVP separato e circoscritto. Il bisogno è concreto e distinto dall’affitto breve: chi possiede un ufficio o più stanze deve confrontare canoni, utilizzi ricorrenti, costi e capitale. Il caso 305 dimostra un problema utile da risolvere prima di discutere il rendimento: l’unità di tariffa può cambiare il ricavo annuo di oltre quattro volte. Questa è evidenza di un’ambiguità del caso comunicato, **non una dimostrazione di domanda di mercato o disponibilità a pagare**.

RendimentoBB resta nel perimetro immobiliare. Nessun gestionale sanitario, nessun dato pazienti, nessun recupero dei servizi digitali generalisti sospesi. La nuova sezione pubblica si trova dai collegamenti in Analizza e Immobili, senza aggiungere una voce principale all’header.

## Quattro valutazioni simulate

Sono percorsi simulati sul codice e sull’interfaccia con DOM di test, non persone reali, interviste o test visuali su dispositivi.

| Profilo | Percorso verificato e giudizio | Limite rilevante |
|---|---|---|
| A · Proprietario | Situazione “già posseduto”, valore 180.000 €, nuovi lavori 10.000 €, canone 305 €/mese. Il valore del bene rimane distinto dai nuovi 10.000 €; debito residuo separato. Valore percepito plausibile: confrontare rendita del bene e ritorno sull’adeguamento. | Il ritorno sul nuovo capitale può essere elevato se l’adeguamento è piccolo: non è ritorno sull’intero patrimonio. Servono costi, contratti e IVA reali. |
| B · Investitore | Acquisto 180.000 €, spese 12.000 €, lavori 10.000 €, altro 3.000 €, nuovo prestito 120.000 €: fabbisogno proprio 85.000 €. Rata confrontata con annuità indipendente; cashflow negativo conservato. Giudizio: utile per scartare scenari fragili. | Non certifica credito, autorizzazioni o valore futuro; nessun piano fiscale o rivendita. Prova Investor non aggiunge salvataggio commerciale in questa release. |
| C · Gestore | Due stanze, tariffa per utilizzo su R1 e canone stanza intera su R2. Chiusura di un lunedì riduce gli utilizzi di R1, non il canone fisso. Doppia assegnazione rifiutata senza corrompere lo scenario. Calendario mensile, fasce personalizzate, ricavi e capacità per stanza. Giudizio: il percorso più vicino al bisogno iniziale. | Calendario economico annuale, non agenda operativa sanitaria; chiusure solo giornaliere; niente salvataggio pluriennale o gestione incassi. |
| D · Consulente | Controllati scorporo IVA solo esplicito, N/A con IVA incerta, formule, prorata mesi, capitale, break-even oltre 100%, costi e scenari negativi. Fonti e ipotesi dichiarate. Giudizio: base leggibile per confronto con il cliente. | Per uso professionale continuativo mancano archivio, versionamento scenari, report e verifica con casi/documenti reali. Nessuna certificazione dei risultati. |

## Cosa è stato implementato

- Motore commerciale puro/versionato, con riuso della sola rata mutuo esistente.
- IT/EN, avvio vuoto e due esempi 305 distinti; nessuna unità tariffaria prescelta per i nuovi contratti.
- Posseduto/acquisto, investimento, finanziamento nuovo e debito esistente, costi fissi e variabili.
- Stanze a canone mensile, pacchetti ricorrenti mensili, singole fasce per utilizzo; coesistenza semplice su capacità distinta.
- Giorni di apertura, orari personalizzati non sovrapposti, contratti inclusivi, chiusure, calendario economico e blocco collisioni nell’anno scelto.
- Corrispettivi e ricavi senza IVA separati, risultati per stanza, margine, cashflow prima imposte, rendimenti con denominatori espliciti, concentrazione, pareggio e sensibilità.
- Sei indicatori principali visibili e approfondimenti richiudibili; campi da 16px, controlli touch, tabelle scorrevoli e stili isolati.
- Chatbot: riconosce il perimetro commerciale, spiega formule e limiti senza leggere la simulazione o riutilizzare valori turistici; non promette PDF o salvataggi commerciali. Preservati i confini privacy, garanzie e documenti in lettura.
- Sitemap con le due pagine; invalidazione della catena cache header/loader/orchestrator. Le altre pagine HTML cambiano solo nei riferimenti cache, salvo i due collegamenti nei percorsi tool/immobili.

## Cosa manca

Confermare con il potenziale utente se 305 sia un canone mensile o il corrispettivo per ogni utilizzo, il contratto, le fasce effettive, la decorrenza, i costi e il trattamento IVA. Fare una prova reale con un proprietario e un gestore prima di attribuire domanda commerciale o definire prezzi. L’interesse verso Investor è una possibilità da misurare, non un risultato del test.

Salvataggi account, dashboard patrimoniale commerciale, PDF, assistente contestuale, calendario avanzato, portafogli e benchmark commerciali restano fasi successive, dichiarate anche nella pagina. Il nuovo modulo non scrive oggetti parziali nello schema turistico.

Non è stato effettuato un collaudo visuale su browser/iPhone della RC193 né un test autenticato Investor/Pro. La verifica UI esegue realmente il modulo e i suoi eventi con un DOM simulato; non prova resa grafica, VoiceOver, tastiera virtuale o comportamenti di Safari. Le prove PMS precedenti non diventano per questo collaudi autenticati superati.

## Regressioni e limiti

Byte-identici rispetto allo ZIP RC192: motori B&B e mutuo, investment-assumptions, app, dashboard/PMS operativo, regole Firestore, API, configurazione Vercel, dipendenze, esportazioni e moduli piani/vendite. Nessuna produzione modificata; nessun servizio o API a pagamento aggiunto.

Il chatbot è il componente condiviso modificato: test dedicati e suite completa verificano i percorsi, ma il rilevamento del nuovo perimetro è basato su espressioni testuali e non interpreta ogni parafrasi o refuso. La futura assistenza sui dati commerciali non va dichiarata attiva.

Le collisioni fuori anno, mesi parziali prorata, canoni fissi durante chiusure, capacità per fasce e non ore, costi annuali interi e imposte sul reddito escluse sono scelte documentate del modello. Leggere `docs/COMMERCIAL_PROPERTY_V1.md` prima di usare il modulo per un caso concreto.
