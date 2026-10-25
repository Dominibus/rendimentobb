# Comuni italiani · ISTAT

Fonte: ISTAT, Elenco dei comuni italiani, riferimento 21 febbraio 2026, scaricato il 25 ottobre 2026. 7.894 comuni, 20 regioni. Include Castegnero Nanto e i codici aggiornati della Sardegna. È uno snapshot amministrativo, non un servizio aggiornato in tempo reale.

- Pagina fonte: https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/
- XLSX ufficiale: https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xlsx
- Licenza: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
- Condizioni della fonte: https://www.istat.it/note-legali/

Trasformazione RendimentoBB: estratte cinque colonne amministrative, conservati i codici come testo e le denominazioni italiane/bilingui, ordinamento per nome. Nessun uso del logo o indicazione di approvazione ISTAT. Hash SHA256 del file originario, date e descrizione della trasformazione sono nel JSON.

Le sigle provinciali sono quelle presenti nello snapshot ISTAT; non sono dedotte da altre fonti. I nomi in altra lingua restano cercabili. Le identità sono i codici ISTAT, quindi non si confondono comuni omonimi o comuni della stessa provincia.

Il registro non contiene prezzi, occupazione, ricavi o benchmark. La copertura dei dati territoriali è una tabella separata di quattro codici esatti: nessuna estensione automatica al resto della provincia, alla regione o al comune più vicino.

Per aggiornare: scaricare il file ufficiale, verificare data, schema e variazioni, aggiornare consapevolmente date/conteggio nello script e rigenerare con `python3 scripts/build-municipalities.py /percorso/Elenco-comuni-italiani.xlsx`, poi eseguire i test. openpyxl è necessario solo alla rigenerazione; non al sito pubblicato. Nessuna API o chiamata esterna dal browser per cercare i comuni.
