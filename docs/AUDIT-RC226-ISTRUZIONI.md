# Consegna RC226: istruzioni di verifica

Base: `4480dc83d17156b9ac5e0a2101f6667a0e05ae34`.
Branch locale: `audit/rc226-final`. Comprende la correzione iniziale `4d8dd786` e il completamento dei report incompleti.
Non è stato effettuato alcun push, merge o deploy.

## Contenuto

L'archivio contiene soltanto le versioni finali dei file aggiunti/modificati rispetto alla base, con percorsi del repository. Include codice, regressioni, questo documento e `docs/AUDIT-RC226-20261029.md`. Non include credenziali, node_modules, log, profili browser, dati reali o PDF sintetici di verifica. Non ci sono file eliminati da applicare.

Prima di applicare i file, verificare la base e usare un branch separato. Non sovrascrivere modifiche locali. Questa consegna non autorizza un deploy.

## Verifica locale

Richiesti Node24, Python3.12; Java21 per l'emulatore. Usare i lockfile esistenti.

```sh
npm ci
npm test
node tests/rc213-financial-identities.mjs
python3 -m unittest discover -s tests -p '*.py'
RB_PDF_QA_DIR=/tmp/rc226-pdfs node --test tests/report-missing-values.test.js tests/roi-missing-inputs.test.js
```

I test dei report usano il bundle jsPDF locale e generano PDF reali delle fixture in IT/EN. Confrontare con `pdftotext -layout`: nei casi assenti/null devono comparire N/D e VALUTAZIONE INCOMPLETA (EN N/A e INCOMPLETE ASSESSMENT), senza rischio basso o giudizio favorevole. Nei casi zero devono restare0%,0€,0/100; con capitale zero il ROI resta N/A. Nessun record storico viene riscritto.

Da `security-tests/`:

```sh
npm ci
./node_modules/.bin/firebase emulators:exec --only firestore --project demo-rendimentobb-security --config ../firebase.security.json 'node --test --test-concurrency=1 *.spec.mjs'
```

Usare esclusivamente il progetto demo e l'emulatore locale per questa verifica. In un ambiente sandbox che impedisce socket/processi figli, un errore di avvio non è un risultato applicativo.

## Contratto engine

Campi omessi/undefined mantengono i default opzionali preesistenti. Valori espliciti null, vuoti, booleani o non numerici generano RangeError con code `roi/invalid_input`; zero numerico e stringhe numeriche valide sono conservati. Un mutuo nullo consente ancora durata0; durata0 con debito positivo resta invalida. Non sono cambiate le formule o le soglie.

## Recupero del diff completo

Nel repository condiviso, questo comando produce un diff applicabile di **tutte** le modifiche, inclusa la prima correzione e le nuove regressioni:

```sh
git diff --binary --full-index 4480dc83d17156b9ac5e0a2101f6667a0e05ae34 audit/rc226-final > RC226-audit-final.patch
```

Su una copia pulita della base, in un nuovo branch di revisione, verificare prima con `git apply --check RC226-audit-final.patch`. Se il branch contiene già le correzioni, non applicarle una seconda volta.

Per ricostruire lo ZIP dei soli file modificati, quando i due riferimenti sono disponibili localmente:

```sh
git archive --format=zip -o RC226-audit-final.zip audit/rc226-final -- $(git diff --name-only --diff-filter=AM 4480dc83d17156b9ac5e0a2101f6667a0e05ae34 audit/rc226-final)
```

Tutti i percorsi di questa consegna sono privi di spazi. L'archivio non contiene il resto dell'applicazione e non è un pacchetto pronto per il deploy.

## Verifica browser ancora da effettuare in produzione

Le verifiche già eseguite nel browser sono locali, con rete esterna bloccata, cache e identità sintetiche. Non provano l'autenticazione reale. Con login protetto e account di prova, verificare salvataggio/riapertura, IT/EN, logout e separazione account; per i PDF usare un account Pro autorizzato. La prova Investor30 giorni esclude i PDF e i nuovi acquisti rimangono sospesi.
