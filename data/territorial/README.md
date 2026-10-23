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

Servono Python 3 e libreria standard, solo sulla macchina di chi prepara i dati. Nessuna dipendenza Python nel sito o nuova funzione server. Gli snapshot gratuiti disponibili possono cambiare: aggiornare selettivamente i quattro record in `scripts/territorial-sources.json`, inclusi checksum ricavati dal download, e verificare date/licenza/schema prima della pubblicazione. Il programma rifiuta checksum diversi.

```bash
python scripts/build-territorial-references.py --cache-dir /percorso/privato/source-cache --download
```

Il flag scarica soltanto i file mancanti elencati nella configurazione; i successivi avvii senza `--download` rielaborano il cache locale. Per riprodurre uno snapshot usare una cache separata con i nomi canonici `napoli-listings.csv.gz`, `roma-listings.csv.gz`, `milano-listings.csv.gz`, `firenze-listings.csv.gz`. Non riutilizzare sotto lo stesso nome un file di un altro periodo. Non inserire la cache nel repository.

Pubblicare soltanto gli aggregati aggiornati, aggiornando anche i riferimenti di cache del codice. Verificare la suite Node e i test Python prima del rilascio. Non sono previsti cron, scraping ricorrente, richieste automatiche a provider dal browser o sottoscrizioni. Resta un piccolo lavoro di aggiornamento manuale: zero nuove API a pagamento non significa aggiornamento garantito o zero manutenzione.
