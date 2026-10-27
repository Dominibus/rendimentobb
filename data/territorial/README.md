# Confronti territoriali di prezzi pubblicati — RC192

Fonte: **Inside Airbnb**, https://insideairbnb.com/get-the-data/ . Licenza: **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/ . Metodo e limiti della fonte: https://insideairbnb.com/data-assumptions/ . Attribuzione: dati Inside Airbnb, elaborazione e aggregazione RendimentoBB; nessuna affiliazione o approvazione da parte del fornitore o di Airbnb.

Questi file contengono **aggregati derivati**, non annunci redistribuiti. Non contengono host, ID annuncio, nomi, recapiti, coordinate o descrizioni. Sono accessibili pubblicamente e riutilizzabili con l’attribuzione e la licenza indicate. I file sorgenti con record individuali non sono inclusi nel pacchetto e non vanno pubblicati.

## Misura

Prezzo base per notte = `price_quote_raw.quote.nightly_subtotal` / notti del preventivo. Non utilizziamo il prezzo legacy preceduto da `$`, né stimiamo la valuta da quel simbolo. Richiesti `currency=EUR`, `is_available=true`, `is_monthly_priced=false`, subtotale positivo, date richieste/coerenti con i campi della fonte e soggiorno di 1–27 notti. Preventivi con cambio delle date restituito, valute diverse o dati mancanti sono esclusi. Esclusi dal metodo sconti e importi separati per pulizie, imposte e commissioni: non è il totale pagabile dal cliente.

Un’osservazione per ID annuncio nella singola città/snapshot; non si riconoscono duplicati fisici tra annunci diversi. Gruppi esatti per zona della fonte, property_type, room_type, capienza dichiarata, mese di check-in quotato, fascia durata (1 / 2–3 / 4–7 / 8–27 notti). Il numero di camere, la superficie, i servizi, lo stato e la qualità non sono omogeneizzati. Il segmento resta quindi un riferimento descrittivo, non una stima di prezzo per un immobile specifico.

Mediana e quartili con interpolazione lineare (posizione `(n−1) × p`), ogni annuncio pesa uno. Nessun taglio discrezionale degli estremi positivi. Soglia di pubblicazione interna: almeno 10 osservazioni. Non prova campionamento casuale o rappresentatività. Per gruppi inferiori alla soglia, numero esatto, prezzi e intervalli puntuali sono null. Non si allarga automaticamente il gruppo per raggiungere la soglia.

La data snapshot nel percorso del provider è diversa dal periodo effettivo `last_scraped`, conservato negli aggregati. `stayMonth` è il mese d’arrivo quotato, non il mese di osservazione. I prezzi si riferiscono a date differenti, non necessariamente ancora prenotabili; non rappresentano una curva stagionale né prezzi in tempo reale. Oltre 180 giorni dall’ultima osservazione della città il pannello marca lo snapshot come storico. Anche uno snapshot recente può includere soggiorni ormai passati: il periodo resta visibile e selezionabile.

Non ricaviamo occupazione dalle notti indisponibili o ADR/ricavi da recensioni. Gli aggregati sono valori **B** derivati da quotazioni pubbliche documentate; la verifica della provenienza non certifica transazioni, incassi, occupazione o ROI. Le vecchie ipotesi interne **C** restano separate.

## Formato

`catalog.json` contiene fonte, URL del file, SHA-256, snapshot, periodo di osservazione, conteggi/esclusioni e schema. Ogni file città contiene `city` e `rows`. Posizioni di ogni riga:

| Indice | Significato |
|---|---|
| 0–5 | zona, tipologia dichiarata, uso alloggio, capienza, mese arrivo, fascia notti |
| 6 | n osservazioni, oppure null sotto soglia |
| 7–9 | P25, mediana, P75 del prezzo base per notte in EUR; null sotto soglia |
| 10–11 | prima/ultima osservazione del segmento; null sotto soglia |
| 12–13 | prima data arrivo / ultima data partenza esclusa dei preventivi; null sotto soglia |

Il CSV scaricabile dal pannello conserva segmento, quantità, unità, date, fonte, licenza e metodo. ADR incassato, occupazione reale e ROI territoriale restano vuoti, non zero.

## Aggiornamento senza servizi a pagamento

Servono Python 3 e libreria standard, solo sulla macchina di chi prepara i dati. Nessuna dipendenza Python nel sito o nuova funzione server. Gli snapshot gratuiti disponibili possono cambiare: aggiornare selettivamente gli otto record in `scripts/territorial-sources.json`, inclusi checksum ricavati dal download, e verificare date/licenza/schema prima della pubblicazione. Il programma rifiuta checksum diversi.

```bash
python scripts/build-territorial-references.py --cache-dir /percorso/privato/source-cache --download
```

Il flag scarica soltanto i file mancanti elencati nella configurazione; i successivi avvii senza `--download` rielaborano il cache locale. Per riprodurre uno snapshot usare una cache separata con i nomi canonici `napoli-listings.csv.gz`, `roma-listings.csv.gz`, `milano-listings.csv.gz`, `firenze-listings.csv.gz`, `bologna-listings.csv.gz`, `venezia-listings.csv.gz`, `bari-listings.csv.gz`, `palermo-listings.csv.gz`. Non riutilizzare sotto lo stesso nome un file di un altro periodo. Non inserire la cache nel repository.

Pubblicare soltanto gli aggregati aggiornati, aggiornando anche i riferimenti di cache del codice. Verificare la suite Node e i test Python prima del rilascio. RC203 aggiunge `.github/workflows/territorial-sources.yml`: controllo il giorno 5 di ogni mese alle 07:23 UTC, eseguibile anche con Actions → Controllo mensile fonti territoriali → Run workflow. Usa solo lettura del repository e nessun segreto. Non scrive commit, non distribuisce e non modifica Vercel, Firebase o le analisi degli utenti.

`refresh-territorial-references.py` consulta il catalogo pubblico e seleziona soltanto snapshot più recenti delle stesse otto città. La fonte offre gratuitamente snapshot trimestrali, non una rilevazione mensile garantita. Quando disponibili, scarica i file dettagliati in una directory temporanea privata, verifica le impronte delle fonti precedenti, rielabora con lo stesso metodo e valida con il lettore pubblico. Se cambiano schema, date o copertura utile, il processo fallisce senza aggiornare il sito. I nuovi checksum documentano i byte acquisiti, non sono firme indipendenti del fornitore.

L'artefatto `territorial-source-review` contiene report.json e, solo quando pronto, candidate/data/territorial/*.json e candidate/scripts/territorial-sources.json. Non contiene sorgenti individuali. Conservazione artefatti: 14 giorni. Il report segnala anche dati pubblicati oltre 180 giorni, cali di copertura oltre metà e variazioni oltre 50% delle mediane dei segmenti esattamente confrontabili. Sono soglie interne di revisione, non test di rappresentatività.

L'amministratore legge il report, verifica copertura e periodi e applica il contenuto di candidate/ su un branch prima della pubblicazione. Nessuna pubblicazione automatica. Se non esistono nuovi snapshot, lo stato è up_to_date: significa ultimo snapshot elencato dalla fonte, non prezzi attuali garantiti. Scaricare il report entro 14 giorni o rieseguire il controllo.

`check-reference-links.py` controlla in parallelo limitato i collegamenti istituzionali presenti nelle pagine Mercato e nelle guide mutuo selezionate. Non verifica il testo delle offerte né l'intero portale. 403, timeout e altri errori sono non verificabili; 404/410 sono non disponibili; i redirect richiedono revisione. Gli esiti sono in reference-links.json, separati dal risultato degli snapshot.

Il sito continua a non chiamare provider dal browser. La lettura degli aggregati interni richiede la rivalidazione della cache HTTP. GitHub Actions può ritardare o disattivare gli avvii programmati: verificare Actions e impostare personalmente le notifiche GitHub. Nessun alert email o monitor indipendente aggiunto. Nessuna API a pagamento; eventuali costi dei runner/artefatti dipendono dal piano e dai consumi GitHub. Non abilitate eccedenze a pagamento per questa patch.


## RC205 — estensione ai capoluoghi con fonte disponibile

Copertura: Roma, Napoli, Milano, Firenze, Bologna, Venezia, Bari e Palermo. I 20 capoluoghi rimangono selezionabili, ma gli altri 12 non hanno una serie compatibile validata in questa release e non ereditano i dati di città vicine. Il selettore distingue confronto disponibile e ipotesi proprie.

Bologna e Venezia usano i dataset cittadini. Bari e Palermo sono selezioni ESATTE del campo `neighbourhood_cleansed` nei dataset regionali Puglia e Sicilia. `geographyFilter` conserva campo, valore e natura della selezione; `regionalSourceRows` registra il totale della fonte regionale, `sourceRows` le sole righe del comune prima dell'ammissibilità dei preventivi. I segmenti hanno come zona il nome del comune: non viene inventata una suddivisione di quartiere. L'applicazione e la documentazione usano la geografia dichiarata dalla fonte, non una certificazione indipendente dei confini di ogni annuncio.

Escluso Trento: la fonte regionale disponibile non offriva nella prima verifica una selezione comunale univoca validata; non si pubblica la media del Trentino come media di Trento. Esclusi i restanti capoluoghi senza fonte compatibile in questo catalogo. Nessuna pretesa che fonti alternative non possano esistere.

La configurazione e lo stesso elaboratore alimentano anche il workflow RC204: i quattro comuni nuovi partecipano ai controlli mensili successivi senza modifiche al cron. Nuove serie sempre sottoposte a revisione, non pubblicate automaticamente. Raw CSV regionali/cittadini solo nella cache privata temporanea, mai nello ZIP o nel repository. Python standard library, nessuna nuova dipendenza o API a pagamento.
