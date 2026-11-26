# Primo utilizzo — audit e correzioni UX, 26 novembre 2026

Base verificata su GitHub e nel checkout: `6e1afd39a770f839515a62fcaf74598a3a03a0cc` (main, PR #17 integrata).
Branch: `ux/first-use-clarity-20261126`. Le PR aperte #11, #12 e #13 restano separate: non sono state integrate né modificate.

## Evidenze e priorità

La home offriva analisi e gestione senza rendere immediato che il simulatore fosse gratuito e accessibile senza registrazione. Il percorso di prova era descritto lontano dall'ingresso; il simulatore invitava a salvare senza precisare nel testo iniziale che occorre Investor. I tab della home dichiaravano `role="tab"` ma non gestivano frecce, Home/End o un singolo punto di tabulazione. Email e password erano identificabili soprattutto dal placeholder.

Nel browser locale la baseline non presentava overflow a 390, 768 e 1440 px. La baseline Node completa passava con 2.421 test. Non è stato necessario un ridisegno generale.

## Intervento

- Home: messaggio esplicito per investitori, proprietari e gestori, CTA principale gratuita, guida in tre passaggi al posto della sequenza decorativa. Conservati gestione B&B, locali/studi, demo, Autopilot, calcolo rapido, piani e approfondimenti.
- Prova: account → verifica email → conferma in Abbonamento → analisi/salvataggio/dashboard. Sono espliciti idoneità Free, prova non già utilizzata, assenza di attivazione automatica alla registrazione, nessuna carta/addebito/rinnovo automatico, ritorno a Free, PDF esclusi e nuovi acquisti sospesi.
- Simulatore: distinti lettura gratuita e salvataggio Investor; chiariti tariffa ipotizzata e occupazione, con `aria-describedby`; etichette principali disponibili anche prima della traduzione. Titolo e descrizione social descrivono una simulazione, senza suggerire guadagni prevedibili.
- Login: guida facoltativa statica, etichette persistenti email/password, nome accessibile del profilo professionale. Nessuna modifica a SDK, handler di autenticazione, redirect, verifica email o attivazione della prova.
- Tastiera: skip link su home e simulatore; frecce con ritorno circolare, Home/End, focus e `tabindex` coerenti nei tab della home. CSS circoscritto e versionato per le tre pagine.

Formule, sorgenti dati, Firestore rules, endpoint, email, account, pagamenti e autorizzazioni restano invariati. Nessuna dipendenza aggiunta e lockfile invariato. Lo stato vuoto autenticato e la guida PMS già esistenti sono stati esaminati senza riscriverli.

## Verifiche eseguite

| Controllo | Esito e perimetro |
| --- | --- |
| Dipendenze | `npm ci --ignore-scripts`, installazione dal lockfile riuscita |
| Regressioni Node finali | `npm test`: 2.422 passati, 0 falliti, Node 24.19.0; comprende piani, trial, isolamento, PDF, PMS, simulatori e autenticazione con fixture/harness |
| Tastiera | Nuovo test di comportamento: frecce, ritorno circolare, Home/End, focus, selezione e Tab non intercettato |
| Identità finanziarie | `node tests/rc213-financial-identities.mjs`: 638 passate |
| Fonti | `node scripts/audit-source-registry.mjs`: integrità locale valida; nessun checksum modificato |
| Python del workflow | 25 test territoriali + 4 OMI + 2 turismo passati |
| Statici | `node --check js/home-2026.js`, `git diff --check` passati; nessun lint o build di produzione definito nel package.json: il sito è statico con API Vercel |
| Riferimenti locali | Home 59, tool 54, login 14 riferimenti unici a link/script/stylesheet: nessun percorso mancante |
| Browser locale | Chromium reale headless: 32 combinazioni, home/tool/login/demo PMS, IT/EN, larghezze 360/390/768/1440. Nessun overflow; nessuna eccezione JavaScript `pageerror` durante i controlli. Verificati tab/focus, guida, campi e collegamenti descrittivi. Nessun submit di registrazione/login/trial o scrittura account |
| Audit dipendenze | 8 vulnerabilità preesistenti: 1 bassa e 7 moderate, nessuna alta/critica al controllo. Il comando con soglia high passa. L'aggiornamento automatico proposto include cambi major di Resend: non applicato in una PR UX |

Una prima esecuzione della suite dopo le modifiche falliva solo su un'asserzione del vecchio slogan della home. Adeguate le tre asserzioni di copy in rc171; conservati i controlli esistenti su brand, percorsi, trial e vendite sospese. Suite finale completa poi passata. La baseline nel sandbox ordinario non poteva eseguire il test calendario per limiti ai sottoprocessi; baseline e verifica finale complete sono state eseguite nell'ambiente consentito, con zero fallimenti.

## Limiti che impediscono il rilascio

Il sito pubblico `https://www.rendimentobb.it/` restituisce dal proxy dell'ambiente `CONNECT tunnel failed, response 403`. La richiesta di aggiunta dei domini non è stata confermata: nessuna impostazione cambiata. Il sito pubblico e la preview Vercel non sono stati collaudati.

Nel browser locale i moduli remoti Firebase non si inizializzano: `window.calculate` rimane non disponibile e la UI dinamica di autenticazione non completa l'avvio. Le prove responsive e sui controlli locali NON sono un collaudo del calcolo nel browser o del percorso registrazione → verifica email → Investor → salvataggio. Nessuna conclusione sul funzionamento del login in produzione deriva da questo limite ambientale. Gli esiti Node delle formule e degli handler sono distinti dalle prove end-to-end.

Non eseguiti: dispositivi Android/iPhone fisici, Safari/WebKit, screen reader, emulatori Firestore, attivazione reale della prova, salvataggio e riapertura con account autorizzati. Non è dichiarata una certificazione WCAG o una revisione visuale completa di tutte le pagine del portale.

Prima del merge occorre aprire la preview dello SHA della PR con rete e account di test autorizzati, verificare inizializzazione senza errori di rete/console, il calcolo dal modulo, registrazione/email, idoneità della prova, salvataggio/riapertura, cambio lingua/account/logout e restrizioni Free/Investor/Pro. Verificare anche Safari su iPhone e dispositivi touch. Nessun record reale da usare per il collaudo.

## Produzione e valutazione

Le correzioni sono consegnate in PR; nessun merge o deploy di produzione eseguito perché le verifiche necessarie sopra sono aperte. Le preview automatiche di GitHub/Vercel, se disponibili, non costituiscono verifica funzionale. Netlify è estraneo al rilascio e non è stato modificato.

L'ingresso comunica meglio pubblico, utilità, gratuità e passi della prova; le funzioni esistenti restano raggiungibili. È pronto per una revisione UX della preview, non ancora per dichiarare verificato l'onboarding di nuovi tester.

Tre priorità successive, senza sviluppo automatico:

1. Completare il collaudo di preview con account sintetici, rete consentita e Safari, poi valutare il rilascio.
2. Osservare nuovi tester mentre simulano, richiedono Investor e salvano: misurare comprensione e punti di abbandono.
3. Revisionare separatamente gli aggiornamenti delle dipendenze e le PR aperte, mantenendo distinti UX, diagnosi auth e funzionalità.
