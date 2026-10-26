# RendimentoBB RC200 — Audit e sole ottimizzazioni

Data: 26 ottobre 2026. Base: RC199 pubblicata, ricostruita dal repository allegato e dalla patch RC199 già consegnata. Nessuna nuova funzionalità di prodotto, piano o integrazione. Le correzioni sono candidate, non pubblicate da questa sessione.

## Valutazione

La base economica e operativa campionata è coerente. Non è corretto chiamare il portale impeccabile: il collaudo Pro ha rivelato un difetto evidente della dashboard e il test del lettore PDF ha individuato una lettura errata di alcune colonne. La priorità è consolidare questi flussi, mantenendo distinti ipotesi, prenotazioni e movimenti registrati.

## Copertura e qualità dell'evidenza

| Area | Verifica svolta | Limite |
|---|---|---|
| Report ricevuti | Quattro PDF, 23 pagine, CSV e cinque schermate; testo, rendering e riconciliazione | Non sono estratti bancari o certificazioni fiscali |
| Account Pro annuale | Accesso reale; dashboard, avvisi, prenotazioni, calendario e strutture/lavori IT/EN; archivio commerciale | Nessuna creazione, modifica, cancellazione o importazione di record reali |
| Autopilot | Priorità quotidiane, arrivi di domani con refuso, confronto con centro avvisi | Prove campionate; non ogni formulazione linguistica |
| Admin | Login reale; Operations Center e leads; prova di accesso negato allo stesso percorso con account Pro | Non verificata la consegna delle email o l'efficienza di tutti i servizi esterni |
| Calcoli e sicurezza | Suite automatica completa; regole, autorizzazioni server, HTML/JS e header HTTP campionati | Non penetration test, non audit delle impostazioni cloud, non verifica completa delle dipendenze o prova di ripristino |
| SEO | Sitemap e struttura delle pagine | Nessun accesso a Search Console/GA4: traffico, ranking e conversioni non dimostrati |
| Mobile | Analisi del responsive nel codice e delle schermate fornite | Nessun collaudo su iPhone reale; uno screenshot lungo e ridimensionato non prova il viewport di un telefono |

Il browser ha verificato la produzione precedente alla RC200. La resa visiva delle modifiche CSS e della home richiede il controllo dopo il caricamento della patch.

## Riconciliazione dei documenti

### Settembre: PDF operativo, PDF andamento e CSV

Il periodo 1 settembre incluso / 1 ottobre escluso comprende 30 giorni. Quattro immobili, una unità disponibile per immobile ogni giorno secondo il modello: 120 notti disponibili.

| Indicatore | Dato | Controllo indipendente |
|---|---:|---|
| Ricavi prenotati attribuiti | 2.010,00 EUR | Somma delle righe CSV e totale dei PDF |
| Notti prenotate | 18 | Somma delle righe CSV |
| Occupazione portfolio | 15,0% | 18 / 120 × 100 |
| ADR | 111,67 EUR | 2.010 / 18 |
| RevPAR portfolio | 16,75 EUR | 2.010 / 120 |
| Occupazione immobile con soggiorni | 60,0% | 18 / 30 × 100 |
| RevPAR stesso immobile | 67,00 EUR | 2.010 / 30 |
| Quota prevista del sottoinsieme confrontabile | 3.150,00 EUR | Ipotesi annue collegate ripartite sul periodo |
| Scostamento confrontabile | -36,1905% | (2.010 - 3.150) / 3.150 × 100 |

I PDF arrotondano lo scostamento a -36,2%, il CSV conserva più decimali. L'occupazione 15% del portfolio e 60% del singolo immobile sono entrambe corrette: i denominatori sono diversi. I ricavi di tutti i periodi, 9.010 EUR, non vanno confrontati con i soli 2.010 di settembre.

Tre immobili risultano collegati a simulazioni; uno solo entra nel confronto omogeneo di quel periodo. Le righe senza soggiorni non vengono presentate come prova di domanda nulla o morosità. Chiusure e camere multiple non sono modellate nel denominatore B&B: il limite è esplicito e permane.

### Nuova simulazione: fattibilità e investimento/gestione

| Voce | Valore verificato |
|---|---:|
| Prezzo / capitale proprio | 160.000 / 40.000 EUR |
| Tariffa / occupazione | 143 EUR / 70% |
| Ricavi lordi annui | 36.536,50 EUR |
| Costi mensili / annui | 797 / 9.564 EUR |
| Commissioni del modello | 15% dei ricavi |
| NOI | 21.492,025 EUR |
| Aliquota del modello | 21% sul risultato operativo |
| Mutuo / TAN / durata | 120.000 EUR / 3,5% / 20 anni |
| Rate annue | 8.351,41994 EUR |
| Cashflow annuo / mensile | 8.627,27981 / 718,93998 EUR |
| ROI equity | 21,5682% → 21,6% |
| ROI sul prezzo | 5,39205% → 5,4% |
| DSCR / rischio | 2,57346 → 2,57 / 23 su 100 |

Le formule del motore ricostruiscono i risultati. Il 21% è un'aliquota del modello semplificato: la correttezza aritmetica non certifica il trattamento fiscale applicabile al caso reale.

Il report di andamento usa una diversa analisi collegata, con cashflow 9.799,82 EUR e ROI 32,7%. Il report integrato della nuova simulazione indica invece assenza di collegamento PMS verificato. Questa differenza è documentata: non si deve forzare il collegamento per far coincidere due scenari distinti.

## Difetti riprodotti e correzioni RC200

| Priorità | Prima | Correzione candidata |
|---|---|---|
| Alta | Con testo estratto a intestazioni affiancate, il parser leggeva 160.000 come cashflow e 120 come DSCR dal PDF integrato allegato; punteggio assente | Lettura delle righe complete e delle celle esplicitamente etichettate; 8.627,28 / 2,57 / 86 corretti. Prove IT/EN e N/A, senza ricostruire valori assenti |
| Media | La guida occupava la prima colonna della dashboard; la scheda KPI finiva a destra, con celle di circa 77 px | Griglia a tutta larghezza indipendente da :first-child e KPI adattivi, senza alterare i dati |
| Media | «Non ho capito, blurf zzz: puoi chiarire?» riceveva una risposta sul mercato | Richiesta esplicita di chiarimento prima di ereditare un argomento estraneo dalla memoria |
| Media | Domanda di navigazione sul calendario degli studi riceveva una lunga spiegazione finanziaria | Risposta breve con percorso corretto e limiti d'accesso; formule ancora disponibili alle domande pertinenti |
| Media | Collegamenti condivisi verso pagine commerciali potevano riportare dall'inglese all'italiano | Destinazioni IT/EN coerenti, mantenendo query demo e ancore; scelta lingua conservata anche dalle pagine statiche |
| Bassa | Market senza scelta preselezionava Ancona per un confronto tra valori nulli | Nessuna preselezione se manca una città riconosciuta |
| Bassa | Pulsanti principali della home troppo in basso | Pulsanti e condizioni della prova anticipati dopo il messaggio principale, riutilizzando il contenuto esistente |
| Bassa | Permanenza media italiana con punto decimale; nota admin sul «valore potenziale» | Formato numerico locale e testo coerente con un indice interno espresso in punti |

Ampliato il riconoscimento di alcuni refusi noti (prenottazioni, calndario, calender). Non è una garanzia di comprensione di qualsiasi errore o domanda. L'errore tecnico dell'assistente invita ora a riformulare e precisare il contesto.

I PDF originali non sono stati riscritti. Il presunto difetto di spaziatura apparso in un primo rendering era una differenza del visualizzatore: lo stesso file è leggibile con un secondo motore. Il difetto del parser è invece riproducibile sui numeri estratti e distinto dalla resa grafica.

## Fonti esterne ricontrollate il 26 ottobre 2026

| Fonte | Esito e perimetro |
|---|---|
| ISTAT, elenco comuni | La pagina ufficiale indica il file aggiornato al 21/02/2026, coerente con lo snapshot incluso. Nessun dato di mercato implicito |
| Inside Airbnb, Get the Data | Elenca Roma 17/09/2026, Napoli/Milano/Firenze 19/09/2026, coerenti con i riferimenti inclusi. Si tratta di dati pubblicati e aggregati, non di ADR incassato o occupazione effettiva certificata |
| Banca d'Italia, Banche e moneta | Il fascicolo 09/10/2026 per agosto riporta TAEG medio nuovi mutui abitazioni 3,99%, luglio 3,81%. La serie 2026 consultata non mostra una pubblicazione successiva di quella serie |

URL verificati:
- https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/
- https://insideairbnb.com/get-the-data/
- https://insideairbnb.com/data-assumptions
- https://www.bancaditalia.it/pubblicazioni/moneta-banche/2026-moneta/index.html
- https://www.bancaditalia.it/pubblicazioni/moneta-banche/2026-moneta/statistiche_BAM_20261009.pdf

Non sono state riscaricate e rigenerate integralmente tutte le righe degli archivi sorgenti. Il controllo conferma l'esistenza e le date delle fonti, il metodo incluso e le regressioni territoriali, non certifica ciascun annuncio. I riferimenti numerici interni statici restano esempi dichiarati: non sono fonti verificate. Per comuni non coperti il sistema deve continuare a dichiarare l'assenza di dati, senza estendere statistiche di altre città. Nessun aggiornamento in tempo reale è stato aggiunto o promesso.

## Riscontro con i feedback precedenti

Il riepilogo dei confronti precedenti richiama: segmentare i benchmark per zona e tipologia, indicare fonte e periodo, distinguere ipotesi e osservazioni; rendere immediato il vantaggio del prodotto; chiarire piani e prova; orientare la dashboard alle priorità; dimostrare i risultati con un caso concreto. Le osservazioni sui benchmark erano attribuite nel contesto precedente al confronto con Giovanni Molinari, non a una nuova intervista svolta qui.

Questo audit risponde a tali criteri con fonti segmentate e datate, riconciliazione numerica, priorità Pro confrontate con gli avvisi e correzioni del percorso. Inviti a call, curiosità e disponibilità a visitare il sito non sono stati conteggiati come test completi o disponibilità a pagare. Non vengono inventate citazioni dei tester.

## Sei profili: giudizio aggiornato

| Profilo | Risultato del controllo |
|---|---|
| Proprietario | Percorso immobile posseduto e capitale zero coerente nel codice e nelle regressioni; distinguere valore del bene e denaro di avvio |
| Investitore | Formule e report del caso allegato coerenti; le ipotesi fiscali e di mercato richiedono verifica del caso |
| Gestore B&B | Priorità e calendario utili e campionati su Pro; la griglia attuale è da correggere prima di considerare la dashboard rifinita |
| Consulente | CSV e traccia delle ipotesi aiutano la verifica; il parser corretto è importante; nessun ROI territoriale verificato disponibile |
| Proprietario di locale | Archivio Pro reale si apre; nessun record commerciale esistente nel conto controllato. Nessuna scrittura reale effettuata |
| Gestore di studi | Funzioni di demo e regressioni stanze/fasce restano distinte dal B&B; non si gestiscono pazienti o prestazioni sanitarie |

Sono valutazioni dei percorsi, non sei interviste indipendenti.

## Sicurezza e gestione operativa

- In produzione l'account Pro riceve accesso negato ai leads. L'account admin accede a Operations Center e al campione di leads.
- Operations Center mostra esecuzioni del 26 ottobre intorno alle 08:00 Europe/Rome, nessun errore nelle registrazioni esposte e code campionate senza interventi segnalati. Un'email PMS risulta accettata dal provider: ciò non prova consegna in casella. Non sono stati lanciati invii di prova.
- Il campione leads è di 150 eventi, non l'intero archivio. Eventi ripetuti e test non sono nuovi clienti; l'indice non è un valore economico.
- Verificati in HTTP su home/login/dashboard: nosniff, DENY, HSTS e referrer policy; login/dashboard no-store. CSP non presente sui tre percorsi campionati.
- La RC200 aggiunge una CSP di base (object-src none, base-uri self, frame-ancestors none) e no-store ai due percorsi gestionali commerciali. Non limita script-src: non va descritta come protezione completa contro XSS. Le policy più specifiche già presenti restano nel file di configurazione.
- La suite copre controlli UID, piano lato server, limiti input, duplicati/idempotenza, export sicuro e isolamento documenti/account. Le impostazioni IAM/cloud, regole effettivamente distribuite, rotazione segreti, backup, ripristino e vulnerabilità delle dipendenze richiedono verifiche dedicate: non sono certificati da questo audit.
- Sessioni di collaudo chiuse al termine; nessun dato privato dei report o dei leads viene incluso nel pacchetto di codice.

## SEO

39 URL presenti nella sitemap: file corrispondenti, canonical, descrizione e un solo H1; nessun noindex trovato su quelle pagine. Controllo strutturale su 51 pagine, zero risorse locali mancanti, ID duplicati o errori di sintassi rilevati. Non equivale a certificare ogni contenuto o ogni collegamento esterno.

L'utilità dei contenuti e la chiarezza del percorso sono una buona base. Il traffico non è garantibile: servono dati Search Console su indicizzazione, query, impressioni e clic e dati sul completamento delle prove. Nessuna pagina per città con contenuti o numeri inventati è stata aggiunta.

## Verifica finale e condizioni di chiusura

- 1.887 test Node superati, zero errori.
- 9 test Python territoriali superati.
- Controlli mirati: parser IT/EN con colonne e N/A, richiesta incomprensibile dopo memoria mercato, navigazione commerciale con refusi, lingua dei collegamenti con query demo e comune iniziale vuoto.
- PDF e CSV allegati riconciliati; PDF originali invariati.

Dopo il deploy: ricontrollare la larghezza KPI con Pro, la posizione dei pulsanti home, il parser nello stesso browser con i PDF reali, la selezione iniziale vuota di Market, i collegamenti EN commerciali e gli header HTTP. Completare il collaudo su iPhone reale. Un nuovo account Investor e le scritture reali non sono stati provati in questa sessione; i permessi sono coperti da regressioni automatiche, non da un nuovo test live di quel piano.

Restano limiti di perimetro: PMS B&B a unità singola senza channel manager, PDF commerciali assenti, fonti territoriali non universali, controlli admin parziali. Nessuna di queste funzioni è stata ampliata, in conformità al blocco delle nuove funzionalità.
