# RendimentoBB — Audit generale RC201 e integrazione SEO

**26 ottobre 2026 · Stato: PRONTO PER TEST CONTROLLATI, con limiti documentati.**

La RC201 è una candidata da revisionare e pubblicare manualmente. Produzione, DNS, Search Console, pagamenti, account e dati degli utenti non sono stati modificati. Le operazioni nel simulatore commerciale pubblico sono rimaste in memoria. Le vendite restano sospese.

## Il giudizio sul prodotto

Il vantaggio credibile di RendimentoBB è il percorso che collega ipotesi immobiliari, lettura dei risultati e gestione operativa essenziale. È particolarmente adatto a un proprietario o piccolo investitore italiano che vuole capire i numeri e confrontare le proprie ipotesi. Non è ancora dimostrato che sostituisca un PMS professionale con canali sincronizzati o uno strumento di intelligence territoriale basato su dati commerciali estesi.

La base matematica campionata è coerente. La debolezza più concreta trovata in questo audit è invece la distanza tra alcune promesse delle pagine Immobili e ciò che il percorso produce: numeri statici non riproducibili, dati del link non trasferiti e testi che potevano suggerire importazione automatica dagli annunci. La patch corregge questi punti senza cambiare il motore finanziario.

Non assegno percentuali di completamento o voti di precisione: il passaggio dei test non dimostra autonomia, conformità, domanda commerciale o assenza di difetti.

## Base e metodo

- Repository: `Dominibus/rendimentobb`, `main`, commit **28ad7f879c8774970ec35bf5af84ec9cd6d5c444**, registrato il 26 ottobre 2026 alle 10:36:45 Europe/Rome. Verifica di tutti i **690 blob** contro gli hash della tree GitHub prima delle modifiche.
- Architettura: HTML/CSS/JavaScript statici, moduli ES e script globali; API serverless Vercel; Firebase Authentication/Firestore; Stripe e Resend lato server. Non c’è un framework SPA o una build di bundling configurata nel package principale.
- Inventario: **51 pagine HTML**, **39 URL in sitemap**, **12 endpoint API**, **23 moduli `lib`**. Documentazione frammentata tra rilasci, README dei dati e test; manca un README generale alla radice.
- Nuovo controllo HTTP di tutti i 39 URL della sitemap: **39 risposte finali 200**, nessun `X-Robots-Tag: noindex` rilevato. Il controllo HTML conferma canonical, descrizione, un H1 e assenza di noindex per queste pagine. Non equivale all’indicizzazione Google.
- Verifica interattiva del percorso Immobili Roma → Analizza e del caso commerciale 305 €. Sono mantenute come evidenze distinte le verifiche Pro già svolte in questa conversazione sulla RC200: KPI, avvisi, IT/EN, chatbot e Autopilot. Non sono presentate come nuove prove di scrittura.
- Suite locale completa, prove finanziarie aggiuntive indipendenti, regressioni territoriali e controllo dipendenze. Risultati dettagliati in `RC201_TEST_E_COPERTURA.md`.

Non è stato eseguito un controllo manuale di ogni pulsante di ogni pagina a tutte le larghezze, un penetration test, un acquisto, un ripristino cloud, un nuovo account Investor o un invio reale di email. Mancano misure di Core Web Vitals sul campo e una prova su iPhone reale. Queste lacune restano aperte.

## Problemi confermati e correzioni

### 1. Trasferimento dalla scheda immobile al simulatore — alta

URL verificato: `/immobili/roma/`, prima scheda, pulsante “Analizza investimento”. Il link dichiarava prezzo 380.000 €, tariffa 145 €, occupazione 70%. Dopo la navigazione il prezzo era vuoto e l’occupazione 76%; la tariffa 145 coincideva con un valore predefinito della città, non provava l’importazione.

La RC201 importa atomicamente prezzo, tariffa e occupazione validi da tutti i 12 link delle quattro pagine città. Rifiuta parametri duplicati o fuori intervallo. Attende la fine dell’inizializzazione dei valori precedenti; non calcola né salva automaticamente. Evita di ereditare capitale e costi da un altro immobile, segnala i dati ancora da completare e conserva la priorità del percorso mutuo esistente.

### 2. ROI e cashflow dimostrativi senza ipotesi riproducibili — alta

Le 12 schede città e le quattro schede della pagina Immobili esponevano rendimenti/cashflow senza capitale proprio, costi, imposte e finanziamento sufficienti a ricostruirli. Ad esempio Roma Trastevere mostrava 14,1% e +980 €/mese: non è possibile provare o smentire quel rendimento con i soli tre input pubblicati. Non è una formula del motore da correggere, è un difetto metodologico della presentazione.

La patch conserva gli esempi di prezzo, tariffa e occupazione, ma sostituisce gli output non riproducibili con “da calcolare”. Anche la ricerca dinamica non espone più ROI e punteggi arbitrari: l’API restituisce `null` per gli output finanziari non calcolati. Restano filtri e ordinamenti per prezzo/superficie; i vecchi nomi tecnici dei parametri restano accettati per compatibilità. Nessun costo viene inventato per far tornare un rendimento preesistente.

### 3. Promesse e percorso di acquisizione — media

Corrette nelle pagine interessate le frasi che attribuivano solo a Pro l’analisi completa: Investor comprende analisi e gestione; Pro aggiunge PDF. Chiarito che un URL Idealista/Immobiliare.it è un riferimento per una scheda manuale, non un’importazione verificata di annuncio, prezzi o disponibilità. La CTA romana verso tale funzione porta ora alla scheda Immobili.

### 4. Collegamenti e accessibilità — media/bassa

I quattro collegamenti città della pagina Immobili erano `div` con JavaScript. Sono ora link HTML con `href`, utilizzabili nativamente da tastiera e direttamente estraibili dal crawler. Aggiunto `alt=""` alle 12 immagini decorative delle schede, per non farle annunciare come file o fingere fotografie verificate degli immobili. Rimossa una intestazione nascosta con una sequenza di parole chiave. Non sono state aggiunte pagine, keyword ripetute o recensioni/schema inventati.

## Funzioni: cosa è solido e cosa resta limitato

| Area | Valutazione pratica |
|---|---|
| Simulatore B&B | Formule e casi coperti dalle regressioni. Cashflow dopo i costi del modello, imposta simulata e rate. ROI sul capitale distinto dal rendimento sul prezzo. Nessun esito garantito. |
| Capitale e lavori | Il modello commerciale esplicita acquisto, spese e lavori. Nel percorso B&B occorre verificare separatamente il budget iniziale e ciò che è effettivamente incluso nel capitale inserito; non è una contabilità di tutti i costi di acquisizione. |
| Rischio e Investment Score | Indici euristici con pesi e soglie; non probabilità di perdita o giudizi bancari. Variare un’ipotesi favorevole può migliorare lo score senza dimostrare un mercato migliore. |
| Mutui | Rate nominali e confronti sui dati inseriti; TAN e TAEG non intercambiabili. Preventivi e approvazione bancaria non acquisiti automaticamente. |
| Dashboard | KPI e avvisi leggibili dopo RC200. Serve ancora osservare se i tester individuano le priorità senza assistenza, soprattutto su telefono. |
| PMS B&B | Prenotazioni, disponibilità, attività e report sono utili. Unità singola per immobile; no channel manager. CSV e registrazioni non sono sincronizzazione con Booking/Airbnb. |
| Commerciale | Motore separato per canoni, stanze e fasce, con archivio operativo dedicato. Scenari, contratti confermati e movimenti sono distinti. Non gestisce pazienti; PDF commerciale non disponibile. |
| Chatbot | Motore prevalentemente locale a regole, riconoscimento di intenti e risposte guidate. Non è dimostrata nel codice una chiamata a un LLM esterno capace di comprendere qualsiasi formulazione. Le prove sui refusi noti non provano comprensione universale. |
| Autopilot | Legge le informazioni disponibili e propone percorsi/priorità. Non completa da solo pulizie, adempimenti, incassi o verifiche documentali. |
| PDF e CSV | I report già ricevuti sono stati riconciliati nell’audit RC200. La correzione del lettore PDF è coperta da regressioni; manca ancora la ripetizione del caricamento reale dopo il deploy nello stesso browser. |
| Dati e sicurezza | Isolamento e permessi sono previsti nel codice e nei test. Backup, IAM, regole distribuite e ripristino non sono attestati da un audit del repository. |
| Piani | Free/demo, Investor, Pro e prova 30 giorni hanno controlli distinti. Gli acquisti restano sospesi. Nessuna prova di vendita completata in questa sessione. |

## Verifica del caso commerciale da 305 €

**305 € IVA inclusa non definisce la periodicità e non determina l’aliquota applicabile.** La scelta dell’unità tariffaria è obbligatoria. La prova pubblica, dopo scelta esplicita del canone mensile per una fascia settimanale e IVA ipotizzata al 22%, produce:

- Corrispettivo mensile 305 €; annuale lordo 305 × 12 = **3.660 €**.
- Ricavo senza IVA 3.660 / 1,22 = **3.000 €**; IVA scorporata **660 €**.
- Nel test separato “per singolo utilizzo”, 52 lunedì del 2027 × 305 = **15.860 €**, pari a **13.000 €** senza IVA nell’ipotesi al 22%.
- Con IVA non definita, risultati netti e cashflow restano N/A. Imposte sul reddito escluse dal modello commerciale. Lo scorporo corretto non certifica il regime fiscale del contratto.

Sono risultati di scenari costruiti per il collaudo, non dati del cliente o tariffe di mercato.

## SEO: lettura corretta dei dati Search Console

I numeri seguenti sono quelli comunicati dall’utente dalle proprie schermate; non un nuovo export acquisito dall’account: 140 clic, 601 impressioni, CTR 23,3%, posizione media 14,8 negli ultimi tre mesi. **127/140 = 90,7%** dei clic è attribuito alla query esatta del marchio. Gli altri 13 clic non possono essere tutti classificati non-brand senza vedere le query.

Il CTR complessivo è fortemente influenzato dalla marca. Non misura l’efficacia delle ricerche generiche. La posizione media 14,8 non è il ranking di una keyword specifica. Le 33 pagine indicizzate e 57 non indicizzate appartengono al rapporto precedente della proprietà URL: non sono 57 pagine necessariamente guaste né direttamente confrontabili con i 39 URL della sitemap. Possono includere duplicati, URL con parametri, redirect, pagine private o eliminate; occorre leggere i motivi di esclusione.

| Pagina indicata | Clic / impressioni | CTR ricavato | Lettura e prossimo controllo |
|---|---:|---:|---|
| Mercato | 2 / 195 | 1,03% | Verificare se le query cercano dati/quotazioni effettive mentre la pagina propone un metodo di confronto. |
| Immobili Roma | 2 / 163 | 1,23% | Possibile intento “annunci in vendita” diverso dagli scenari. La patch rende l’offerta più corretta, non trasforma gli esempi in annunci. |
| Academy | 1 / 148 | 0,68% | La categoria può competere con guide specifiche: leggere query e pagina di destinazione. |
| ROI | 1 / 99 | 1,01% | Query molto ampie possono avere intento finanziario diverso dal ROI B&B. Distinguere anche le guide ROI del sito tra loro. |
| Costi aprire B&B | 1 / 58 | 1,72% | Campione ridotto; verificare se si cercano cifre, requisiti locali o un budget personalizzato. |

Queste sono ipotesi diagnostiche, non cause dimostrate. Posizione per query, dispositivo, paese, aspetto della SERP, concorrenti visibili e maturazione dell’indice possono incidere. Un clic in più cambia sensibilmente questi CTR: non è una base per promesse di crescita.

### Risultati tecnici e qualità dei contenuti

Tutti i 39 URL sitemap hanno una controparte HTML pubblica e rispondono 200. Le pagine informative hanno testo statico leggibile senza attendere l’applicazione dei calcoli; alcune navigazioni e i pannelli interattivi richiedono JavaScript. JSON-LD già presente: validità sintattica controllata; nessuna promessa di rich result o test Google simulato.

Le guide ROI, costi e mutuo hanno un compito chiaro. Le pagine Market e ROI città si sovrappongono in parte nell’intento; è un’ipotesi di cannibalizzazione da verificare con query–pagina, non una penalizzazione provata. Il contenuto territoriale resta limitato e non giustifica nuove landing per ogni comune con lo stesso testo.

I titoli e le descrizioni sono generalmente già descrittivi. Non li ho riscritti in massa per inseguire il CTR. Google può scegliere titoli e snippet differenti; una modifica richiede nuova scansione e non garantisce clic. Fonti: [titoli Google](https://developers.google.com/search/docs/appearance/title-link), [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

Le coppie demo e commerciali hanno URL IT/EN distinti e hreflang. Le altre pagine traducono l’interfaccia sullo stesso URL. La home dichiara anche `?lang=en` con canonical italiano: da verificare con URL Inspection prima di considerarla una strategia SEO inglese completa. Per ora il mercato prioritario resta l’Italia. Fonte: [Google sui siti multilingue](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

### Domini e URL obsolete

Le precedenti landing `/basic-beyond/` e `/en/basic-beyond/` rispondono **404**, non sono in sitemap e non sono più offerte dal sito. Non è opportuno reindirizzare automaticamente una vecchia offerta generalista su una pagina immobiliare non equivalente. Se Search Console mostra clic o backlink utili per URL specifici, scegliere una destinazione realmente pertinente dopo esame dei dati.

`rendimentobb.com` porta a `www.rendimentobb.com`, che risponde **200** con la stessa home; il canonical del documento indica `.it`. Il canonical è un segnale, non una prova di consolidamento effettivo. Un redirect di dominio è una proposta separata: prima verificare che nessun webhook, callback o endpoint operativo utilizzi `.com`. Nessuna modifica DNS o hosting applicata qui.

### Acquisizione Investor

Il percorso più credibile è: esigenza concreta → guida pertinente → esempio controllabile → simulazione → prova Investor 30 giorni per salvare e riutilizzare il lavoro. La registrazione ha valore quando l’utente ha già capito cosa conserverà; non deve sembrare necessaria per importare un annuncio che il sistema non importa.

La misurazione attuale consente alcuni eventi pubblici sotto consenso, tra cui apertura demo e ingresso alla prova. Non è documentato un funnel completo e riconciliato per ogni passaggio fino al ritorno e all’analisi salvata. Non aggiungo tracciamenti in questa patch. Usare gli eventi esistenti, i report Search Console e i conteggi operativi disponibili; non sommare lead ripetuti, test e utenti verificati.

Obiettivi da misurare, senza target numerici inventati: clic non-brand per gruppi di query pertinenti; ingressi alle pagine guida; apertura demo; ingresso alla prova; account verificati con prima analisi; ritorno e uso ripetuto. Valutare finestre comparabili, non oscillazioni giornaliere di pochi clic.

## Fonti e attendibilità

Il registro ISTAT contiene 7.894 comuni e i 20 capoluoghi; è anagrafica, non domanda turistica. Gli aggregati Inside Airbnb sono prezzi pubblicati segmentati, non ADR incassato, occupazione o ROI certificati. Le tabelle interne illustrative restano esplicitamente distinte. Il rinnovo degli snapshot è manuale; questa patch non introduce fonti in tempo reale.

Fonti ricontrollate: [ISTAT, riferimento 21/02/2026](https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/), [Inside Airbnb](https://insideairbnb.com/get-the-data/), [Banca d’Italia, serie 2026](https://www.bancaditalia.it/pubblicazioni/moneta-banche/2026-moneta/). Non sono stati riscaricati e ricostruiti tutti gli archivi individuali. I dati bancari medi non sono preventivi personali e non sostituiscono il TAN del proprio finanziamento.

## Autonomia e prontezza

La gestione ordinaria può diventare leggera, ma il sistema non è dimostrato autosufficiente per 7–14 giorni senza alcun presidio. Promemoria, code, recuperi e alcune scadenze sono automatici; eccezioni, supporto, privacy, aggiornamenti fonti, costi e incidenti restano da seguire. I controlli admin dipendenti dal cron non costituiscono un allarme indipendente sul fermo del cron.

La routine proposta è un obiettivo da misurare a basso volume: controlli brevi nei giorni di attività, revisione settimanale di code/costi/supporto, verifica periodica delle fonti e del ripristino. Un’automazione che funziona oggi non dimostra il comportamento durante un’interruzione dei fornitori. La roadmap contiene una simulazione ragionata a 3/7/14 giorni, non una prova di assenza reale.

Prima di considerare il prodotto tecnicamente pronto: chiudere il collaudo completo di account e scritture con dati di prova, verificare mobile reale ed export/PDF, dimostrare un ripristino e un presidio indipendente delle interruzioni. Prima della vendita: validazione fiscale, contrattuale, privacy e organizzativa dei professionisti. La prova gratuita non elimina gli obblighi sui dati: [Garante](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/8981258). Le condizioni di recesso dei servizi vanno verificate sul caso: [MIMIT](https://www.mimit.gov.it/it/mercato-e-consumatori/tutela-del-consumatore/diritti-del-consumatore/diritto-di-recesso?hitcount=0).

**Conclusione:** il motore è una buona base, la RC201 risolve incoerenze concrete del percorso pubblico, la SEO tecnica essenziale è in ordine nei controlli svolti. Visibilità non-brand, autonomia e prontezza commerciale rimangono da dimostrare. Non servono altre funzioni per affrontare queste verifiche.
